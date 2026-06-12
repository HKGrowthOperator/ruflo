<#
.SYNOPSIS
    Hotkey-based switcher between two Windows applications (e.g. browser + desktop app).

.DESCRIPTION
    Registers a global hotkey (default: Alt+Q). Each press minimizes the currently
    focused one of the two configured apps and restores/focuses the other one --
    a fast two-app toggle similar to switching between virtual desktops, without
    leaving the current desktop.

    Apps are identified by process name (without .exe). Window title matching can
    be added via -TitleA / -TitleB to disambiguate multi-window processes.

    Zero dependencies: pure PowerShell + Win32 API (user32.dll) via Add-Type.
    Works on Windows PowerShell 5.1 and PowerShell 7+ (Windows only).

.PARAMETER AppA
    Process name of the first app, e.g. "chrome", "msedge", "firefox".

.PARAMETER AppB
    Process name of the second app, e.g. "spotify", "Code", "EXCEL".

.PARAMETER TitleA
    Optional substring the window title of AppA must contain.

.PARAMETER TitleB
    Optional substring the window title of AppB must contain.

.PARAMETER Modifiers
    Hotkey modifiers, comma-separated. Any of: Alt, Ctrl, Shift, Win. Default: Alt.

.PARAMETER Key
    Hotkey key: a letter, digit, F1-F24 or "Space". Default: Q.

.PARAMETER Once
    Perform a single toggle immediately and exit (no hotkey loop). Useful for
    binding to an external launcher (Stream Deck, AutoHotkey, taskbar shortcut).

.EXAMPLE
    .\win-app-switcher.ps1 -AppA chrome -AppB spotify
    Alt+Q toggles between Chrome and Spotify.

.EXAMPLE
    .\win-app-switcher.ps1 -AppA msedge -AppB EXCEL -Modifiers Ctrl,Alt -Key Space

.EXAMPLE
    .\win-app-switcher.ps1 -AppA chrome -AppB vlc -Once
    One-shot toggle, no background process.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]  [string]$AppA,
    [Parameter(Mandatory = $true)]  [string]$AppB,
    [string]$TitleA = "",
    [string]$TitleB = "",
    [ValidateSet("Alt", "Ctrl", "Shift", "Win")]
    [string[]]$Modifiers = @("Alt"),
    [string]$Key = "Q",
    [switch]$Once
)

$ErrorActionPreference = "Stop"

if ($env:OS -ne "Windows_NT") {
    throw "win-app-switcher only runs on Windows (needs user32.dll)."
}

Add-Type @"
using System;
using System.Runtime.InteropServices;

namespace WinAppSwitcher
{
    public static class Native
    {
        [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
        [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
        [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
        [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hWnd);
        [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

        public const int SW_MINIMIZE = 6;
        public const int SW_RESTORE  = 9;
    }

    public static class HotkeyLoop
    {
        [StructLayout(LayoutKind.Sequential)]
        public struct MSG
        {
            public IntPtr hwnd;
            public uint   message;
            public IntPtr wParam;
            public IntPtr lParam;
            public uint   time;
            public int    ptX;
            public int    ptY;
        }

        [DllImport("user32.dll", SetLastError = true)]
        static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);
        [DllImport("user32.dll")]
        static extern bool UnregisterHotKey(IntPtr hWnd, int id);
        [DllImport("user32.dll")]
        static extern int GetMessage(out MSG lpMsg, IntPtr hWnd, uint wMsgFilterMin, uint wMsgFilterMax);

        const uint WM_HOTKEY     = 0x0312;
        // MOD_NOREPEAT: prevents key-repeat from firing the hotkey while held.
        const uint MOD_NOREPEAT  = 0x4000;
        const int  HOTKEY_ID     = 0xA51;

        // Registers the hotkey on the calling thread (hWnd = NULL posts WM_HOTKEY
        // to the thread message queue) and pumps messages until the process exits.
        // onHotkey is invoked synchronously on this same thread, so a PowerShell
        // scriptblock cast to System.Action is safe here.
        public static void Run(uint modifiers, uint vk, Action onHotkey)
        {
            if (!RegisterHotKey(IntPtr.Zero, HOTKEY_ID, modifiers | MOD_NOREPEAT, vk))
                throw new InvalidOperationException(
                    "RegisterHotKey failed - this hotkey is already in use by another program.");
            try
            {
                MSG msg;
                while (GetMessage(out msg, IntPtr.Zero, 0, 0) > 0)
                {
                    if (msg.message == WM_HOTKEY)
                        onHotkey();
                }
            }
            finally
            {
                UnregisterHotKey(IntPtr.Zero, HOTKEY_ID);
            }
        }
    }
}
"@

function Get-AppWindow {
    param([string]$ProcessName, [string]$TitleFilter)

    $name = $ProcessName -replace '\.exe$', ''
    $procs = @(Get-Process -Name $name -ErrorAction SilentlyContinue |
        Where-Object { $_.MainWindowHandle -ne 0 })

    if ($TitleFilter) {
        $procs = @($procs | Where-Object { $_.MainWindowTitle -like "*$TitleFilter*" })
    }

    # Prefer a window with a non-empty title: browsers spawn helper processes
    # whose main window handle exists but carries no title.
    $best = $procs | Where-Object { $_.MainWindowTitle } | Select-Object -First 1
    if (-not $best) { $best = $procs | Select-Object -First 1 }
    return $best
}

function Show-AppWindow {
    param($Win)
    $h = $Win.MainWindowHandle
    if ([WinAppSwitcher.Native]::IsIconic($h)) {
        [void][WinAppSwitcher.Native]::ShowWindow($h, [WinAppSwitcher.Native]::SW_RESTORE)
    }
    [void][WinAppSwitcher.Native]::SetForegroundWindow($h)
}

function Switch-To {
    param($From, $To)
    [void][WinAppSwitcher.Native]::ShowWindow($From.MainWindowHandle, [WinAppSwitcher.Native]::SW_MINIMIZE)
    Show-AppWindow $To
    Write-Host ("[{0:HH:mm:ss}] {1} -> {2}" -f (Get-Date), $From.ProcessName, $To.ProcessName)
}

function Invoke-Toggle {
    $winA = Get-AppWindow -ProcessName $AppA -TitleFilter $TitleA
    $winB = Get-AppWindow -ProcessName $AppB -TitleFilter $TitleB

    if (-not $winA -and -not $winB) {
        Write-Warning "Neither '$AppA' nor '$AppB' has a visible window."
        return
    }
    if (-not $winA) { Write-Warning "'$AppA' not running - focusing '$AppB'."; Show-AppWindow $winB; return }
    if (-not $winB) { Write-Warning "'$AppB' not running - focusing '$AppA'."; Show-AppWindow $winA; return }

    $fg = [WinAppSwitcher.Native]::GetForegroundWindow()
    [uint32]$fgPid = 0
    [void][WinAppSwitcher.Native]::GetWindowThreadProcessId($fg, [ref]$fgPid)

    if ($fgPid -eq [uint32]$winA.Id) {
        Switch-To -From $winA -To $winB
    } elseif ($fgPid -eq [uint32]$winB.Id) {
        Switch-To -From $winB -To $winA
    } else {
        # Neither app has focus: bring up whichever is not minimized, else AppA.
        $target = if ([WinAppSwitcher.Native]::IsIconic($winA.MainWindowHandle)) { $winB } else { $winA }
        Show-AppWindow $target
    }
}

function Get-VirtualKeyCode {
    param([string]$K)
    $K = $K.Trim().ToUpper()
    if ($K -match '^[A-Z0-9]$')               { return [uint32][char]$K }          # VK_A..VK_Z / VK_0..VK_9
    if ($K -match '^F([1-9]|1[0-9]|2[0-4])$') { return [uint32](0x6F + [int]$Matches[1]) }  # VK_F1 = 0x70
    if ($K -eq 'SPACE')                       { return [uint32]0x20 }
    throw "Unknown key '$K'. Use a letter, digit, F1-F24 or 'Space'."
}

if ($Once) {
    Invoke-Toggle
    return
}

# --- Hotkey mode -------------------------------------------------------------

$modMap = @{ Alt = 0x0001; Ctrl = 0x0002; Shift = 0x0004; Win = 0x0008 }
[uint32]$modFlags = 0
foreach ($m in $Modifiers) { $modFlags = $modFlags -bor $modMap[$m] }

$vk = Get-VirtualKeyCode -K $Key

$hotkeyLabel = ($Modifiers -join "+") + "+" + $Key.ToUpper()
Write-Host "win-app-switcher: $hotkeyLabel toggles '$AppA' <-> '$AppB'. Ctrl+C to quit."

[WinAppSwitcher.HotkeyLoop]::Run($modFlags, $vk, [System.Action]{ Invoke-Toggle })
