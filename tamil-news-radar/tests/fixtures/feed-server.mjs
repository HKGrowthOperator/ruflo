// Lokaler RSS-Fixture-Server: zwei Feeds, die über dasselbe Ereignis berichten.
import http from 'node:http';

const feedA = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Feed A</title>
<item>
  <title>சென்னை பெருநகர பேருந்து கட்டண உயர்வு அறிவிப்பு</title>
  <link>http://localhost:8931/a/1</link>
  <guid>a-1</guid>
  <description>சென்னையில் பேருந்து கட்டணம் உயர்த்தப்படுவதாக போக்குவரத்து துறை அறிவித்துள்ளது.</description>
  <pubDate>Tue, 14 Jul 2026 08:00:00 GMT</pubDate>
</item>
<item>
  <title>கோவையில் புதிய தொழில்நுட்ப பூங்கா திறப்பு</title>
  <link>http://localhost:8931/a/2</link>
  <guid>a-2</guid>
  <description>கோயம்புத்தூரில் புதிய ஐடி பூங்கா திறக்கப்பட்டது.</description>
  <pubDate>Tue, 14 Jul 2026 09:00:00 GMT</pubDate>
</item>
</channel></rss>`;

const feedB = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Feed B</title>
<item>
  <title>Chennai bus fare hike announced: சென்னை பேருந்து கட்டண உயர்வு</title>
  <link>http://localhost:8931/b/1</link>
  <guid>b-1</guid>
  <description>Transport department announces bus fare revision in Chennai metropolitan area.</description>
  <pubDate>Tue, 14 Jul 2026 08:30:00 GMT</pubDate>
</item>
</channel></rss>`;

http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  if (req.url === '/feed-a.xml') res.end(feedA);
  else if (req.url === '/feed-b.xml') res.end(feedB);
  else { res.statusCode = 404; res.end('not found'); }
}).listen(8931, () => console.log('fixture feeds on :8931'));
