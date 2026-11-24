# Dergi sitesi

Her insanı ilgilendiren meseleler üzerine yazan, İngilizce ve Türkçe yayın yapan dijital derginin sitesi. Derginin adı **Automatic Paper**; adı değiştirmek için `site.config.mjs` dosyasındaki `name` satırını değiştirmen yeterli.

## Sitede neler var

- **Ana sayfa:** üstte son 4 sayının kapağı, altında küçük kapaklarla eski sayılar şeridi, kapak yazısı, bölümler, video paneli, üyelik ve bülten.
- **Sayı sayfası:** bir kapağa tıklayınca o sayının editör notu ve içindeki yazılar açılır.
- **Yazı sayfası:** başlık, ana görsel; görselin altında sesli okuma oynatıcısı (hız ayarlı), yazıyı büyütme/küçültme (A− / A+) ve paylaş düğmesi; metnin içinde resim ya da video paneli; en altta kaynaklar ve "Bu sayıdan diğer yazılar".
- **Bölümler, video arşivi, üyelik sayfası, hakkında, arama.**
- **EN | TR** dil düğmesi: İngilizce ana adreste (`/`), Türkçe `/tr/` altında. Bir yazının çevirisi varsa düğme doğrudan çeviriye geçer.
- Görsellerde insan yok. Görsel yüklenmeyen yazılar ve sayılar için otomatik manzara, mimari ve kitaplık görselleri üretilir.

## Siteyi ilk kez yayına almak (bir kerelik)

1. GitHub'da bu depoda **Settings → Pages** bölümüne gir.
2. **Build and deployment → Source** kısmında **GitHub Actions**'ı seç.
3. Site birkaç dakika içinde `https://KULLANICI.github.io/DEPO/` adresinde açılır. Bundan sonra yapılan her değişiklik kendiliğinden yayınlanır.

## Yazı, sayı ve video eklemek

**Yönetim paneliyle (önerilen):**

1. Sitenin adresinin sonuna `/admin/` ekleyip aç.
2. "Sign In with Token" (anahtarla giriş) seç. Anahtarı GitHub'da **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token** yolundan oluştur: yalnızca bu depoyu seç, **Contents** iznini **Read and write** yap. Anahtarı kimseyle paylaşma.
3. **Yazılar**, **Sayılar** ya da **Videolar** bölümünden yeni kayıt ekle ve kaydet. Birkaç dakika içinde sitede görünür.

**Doğrudan dosyayla:** `content/articles`, `content/issues` ve `content/videos` klasörlerindeki örnek dosyaları kopyalayıp düzenleyebilirsin.

### Yazı ayrıntıları

- **Sayı numarası:** yazının hangi sayıda görüneceğini belirler. Bir sayıda "kapak yazısı" işaretli yazı ana sayfada manşet olur.
- **Çeviri eşleştirme anahtarı:** bir yazının Türkçe ve İngilizce hâllerine aynı kelimeyi yaz (ör. `su`).
- **Kaynaklar:** metinde ilgili cümlenin sonuna `[^1]` yaz; kaynak listesindeki ilk satıra bağlanır. `[^2]` ikinci kaynağa bağlanır.
- **Alıntı:** satırın başına `>` koyarsan büyük alıntı olarak görünür.
- **Sesli okuma:** MP3 yüklersen o çalınır. Yüklemezsen yazı okurun tarayıcısının sesiyle okunur.
- **Video:** YouTube bağlantısını yapıştırman yeterli; video yazının içindeki panelde açılır. Video yoksa "Ek görsel" panelde gösterilir.
- **Görseller:** insan içermeyen görseller yükle.

## Ayarlar (`site.config.mjs`)

- `name`: dergi adı
- `sections`: bölümler ve açıklamaları
- `membership`: üyelik paketleri ve fiyatları (şu anki fiyatlar örnektir). Ödeme altyapısı seçilince `joinUrl` satırına ödeme bağlantısı yazılır; o zamana kadar düğmeler "Yakında" görünür.
- `newsletterAction`: bülten kayıt formunun adresi (boşsa form "Yakında" görünür)
- `contactEmail`, `social`: iletişim ve sosyal medya

Arayüz metinleri (menü, düğmeler, "Neden varız" yazısı, sık sorulanlar) `lib/i18n.mjs` dosyasında, her iki dilde.

## Örnek içerik

`content/` klasöründeki 8 sayı, 6 yazı (her biri iki dilde) ve 5 video örnektir; yerlerine kendi içeriğin gelecek. Yazar adı olarak "Editörler" kullanıldı. Kaynak olarak yalnızca herkese açık BM ve UNESCO belgeleri gösterildi.

## Bilgisayarda derlemek

```
npm install
npm run build
npm run preview
```
