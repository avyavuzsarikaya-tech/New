// Sitenin genel ayarları. Dergi adı kesinleşince sadece "name" satırını değiştirmen yeterli.
export default {
  name: 'MAGAZINE NAME',

  // Dergi dilleri. İlk dil ana adreste (/), diğerleri /tr/ gibi alt adreste yayınlanır.
  languages: ['en', 'tr'],

  // Bölümler: id adreste görünür (/sections/health/), başlıklar her dilde ayrı.
  sections: [
    { id: 'environment', en: 'Environment', tr: 'Çevre',
      blurb: { en: 'The earth we share and the trust we hold it in.', tr: 'Paylaştığımız yeryüzü ve ona karşı emanetimiz.' } },
    { id: 'technology', en: 'Science & Technology', tr: 'Bilim ve Teknoloji',
      blurb: { en: 'Discovery, invention and what our tools are doing to us, and for us.', tr: 'Keşifler, icatlar ve araçlarımızın bize ve bizim için yaptıkları.' } },
    { id: 'society', en: 'Society', tr: 'Toplum',
      blurb: { en: 'Family, community and the ties that hold us together.', tr: 'Aile, topluluk ve bizi bir arada tutan bağlar.' } },
    { id: 'economy', en: 'Economy', tr: 'Ekonomi',
      blurb: { en: 'Wealth, work, poverty and fairness.', tr: 'Servet, emek, yoksulluk ve hakkaniyet.' } },
    { id: 'health', en: 'Nutrition & Health', tr: 'Beslenme ve Sağlık',
      blurb: { en: 'What we eat, how we heal, and the body held in trust.', tr: 'Ne yediğimiz, nasıl iyileştiğimiz ve emanet olarak bedenimiz.' } },
  ],

  // Üyelik paketleri. Fiyatlar ÖRNEKTİR; ödeme altyapısı seçilince joinUrl'e ödeme bağlantısı yazılır.
  membership: {
    joinUrl: '', // boşsa düğmeler "Yakında" olarak görünür
    plans: [
      { id: 'monthly', price: '$6', period: { en: '/ month', tr: '/ ay' },
        name: { en: 'Digital Monthly', tr: 'Aylık Dijital' },
        features: { en: ['Every issue and the full archive', 'Audio version of every article', 'Full video library', 'Members’ newsletter'],
                    tr: ['Tüm sayılar ve arşivin tamamı', 'Her yazının sesli hâli', 'Video arşivinin tamamı', 'Üyelere özel bülten'] } },
      { id: 'annual', price: '$60', period: { en: '/ year', tr: '/ yıl' }, featured: true,
        name: { en: 'Digital Annual', tr: 'Yıllık Dijital' },
        features: { en: ['Everything in Monthly', 'Two months free', 'Early access to new issues'],
                    tr: ['Aylık paketteki her şey', 'İki ay ücretsiz', 'Yeni sayılara erken erişim'] } },
      { id: 'supporter', price: '$120', period: { en: '/ year', tr: '/ yıl' },
        name: { en: 'Supporter', tr: 'Destekçi' },
        features: { en: ['Everything in Annual', 'Your name on our supporters page', 'Helps fund free access for readers who cannot pay'],
                    tr: ['Yıllık paketteki her şey', 'Destekçiler sayfasında adın', 'Ödeyemeyen okurların ücretsiz erişimine katkı'] } },
    ],
  },

  // Bülten kayıt formu (ör. Buttondown, Mailchimp form adresi). Boşsa form "Yakında" görünür.
  newsletterAction: '',

  // İletişim e-postası (boşsa gösterilmez)
  contactEmail: '',

  social: [
    // { name: 'X', url: 'https://x.com/...' },
  ],
};
