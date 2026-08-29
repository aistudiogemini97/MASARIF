import { CurrencyConfig } from '../types';

export interface WorldCurrency extends CurrencyConfig {
  englishName: string;
  flag: string;
  country: string;
  region: 'arab' | 'major' | 'asia' | 'europe' | 'americas' | 'africa' | 'oceania';
  popular?: boolean;
}

export const WORLD_CURRENCIES: WorldCurrency[] = [
  // ==========================================
  // 1. العملات العربية والخليجية (Arab & GCC)
  // ==========================================
  { code: 'SAR', symbol: 'ر.س', name: 'ريال سعودي', englishName: 'Saudi Riyal', flag: '🇸🇦', country: 'المملكة العربية السعودية', region: 'arab', popular: true },
  { code: 'AED', symbol: 'د.إ', name: 'درهم إماراتي', englishName: 'UAE Dirham', flag: '🇦🇪', country: 'الإمارات العربية المتحدة', region: 'arab', popular: true },
  { code: 'KWD', symbol: 'د.ك', name: 'دينار كويتي', englishName: 'Kuwaiti Dinar', flag: '🇰🇼', country: 'دولة الكويت', region: 'arab', popular: true },
  { code: 'QAR', symbol: 'ر.ق', name: 'ريال قطري', englishName: 'Qatari Riyal', flag: '🇶🇦', country: 'دولة قطر', region: 'arab', popular: true },
  { code: 'BHD', symbol: 'د.ب', name: 'دينار بحريني', englishName: 'Bahraini Dinar', flag: '🇧🇭', country: 'مملكة البحرين', region: 'arab', popular: true },
  { code: 'OMR', symbol: 'ر.ع', name: 'ريال عماني', englishName: 'Omani Rial', flag: '🇴🇲', country: 'سلطنة عمان', region: 'arab', popular: true },
  { code: 'EGP', symbol: 'ج.م', name: 'جنيه مصري', englishName: 'Egyptian Pound', flag: '🇪🇬', country: 'جمهورية مصر العربية', region: 'arab', popular: true },
  { code: 'JOD', symbol: 'د.أ', name: 'دينار أردني', englishName: 'Jordanian Dinar', flag: '🇯🇴', country: 'المملكة الأردنية الهاشمية', region: 'arab', popular: true },
  { code: 'IQD', symbol: 'د.ع', name: 'دينار عراقي', englishName: 'Iraqi Dinar', flag: '🇮🇶', country: 'جمهورية العراق', region: 'arab', popular: true },
  { code: 'YER', symbol: 'ر.ي', name: 'ريال يمني', englishName: 'Yemeni Rial', flag: '🇾🇪', country: 'الجمهورية اليمنية', region: 'arab', popular: true },
  { code: 'LYD', symbol: 'د.ل', name: 'دينار ليبي', englishName: 'Libyan Dinar', flag: '🇱🇾', country: 'دولة ليبيا', region: 'arab', popular: true },
  { code: 'TND', symbol: 'د.ت', name: 'دينار تونسي', englishName: 'Tunisian Dinar', flag: '🇹🇳', country: 'الجمهورية التونسية', region: 'arab', popular: true },
  { code: 'MAD', symbol: 'د.م', name: 'درهم مغربي', englishName: 'Moroccan Dirham', flag: '🇲🇦', country: 'المملكة المغربية', region: 'arab', popular: true },
  { code: 'DZD', symbol: 'د.ج', name: 'دينار جزائري', englishName: 'Algerian Dinar', flag: '🇩🇿', country: 'الجمهورية الجزائرية', region: 'arab', popular: true },
  { code: 'LBP', symbol: 'ل.ل', name: 'ليرة لبنانية', englishName: 'Lebanese Pound', flag: '🇱🇧', country: 'الجمهورية اللبنانية', region: 'arab', popular: true },
  { code: 'SYP', symbol: 'ل.س', name: 'ليرة سورية', englishName: 'Syrian Pound', flag: '🇸🇾', country: 'الجمهورية العربية السورية', region: 'arab', popular: true },
  { code: 'SDG', symbol: 'ج.س', name: 'جنيه سوداني', englishName: 'Sudanese Pound', flag: '🇸🇩', country: 'جمهورية السودان', region: 'arab', popular: true },
  { code: 'MRU', symbol: 'أ.م', name: 'أوقية موريتانية', englishName: 'Mauritanian Ouguiya', flag: '🇲🇷', country: 'الجمهورية الإسلامية الموريتانية', region: 'arab' },
  { code: 'SOS', symbol: 'ش.ص', name: 'شلن صومالي', englishName: 'Somali Shilling', flag: '🇸🇴', country: 'جمهورية الصومال', region: 'arab' },
  { code: 'DJF', symbol: 'ف.ج', name: 'فرنك جيبوتي', englishName: 'Djiboutian Franc', flag: '🇩🇯', country: 'جمهورية جيبوتي', region: 'arab' },
  { code: 'KMF', symbol: 'ف.ق', name: 'فرنك قمري', englishName: 'Comorian Franc', flag: '🇰🇲', country: 'جزر القمر', region: 'arab' },
  { code: 'ILS', symbol: '₪', name: 'شيكل (فلسطين)', englishName: 'Shekel', flag: '🇵🇸', country: 'فلسطين', region: 'arab' },

  // ==========================================
  // 2. العملات العالمية الكبرى (Major Global)
  // ==========================================
  { code: 'USD', symbol: '$', name: 'دولار أمريكي', englishName: 'US Dollar', flag: '🇺🇸', country: 'الولايات المتحدة الأمريكية', region: 'major', popular: true },
  { code: 'EUR', symbol: '€', name: 'يورو أوروبي', englishName: 'Euro', flag: '🇪🇺', country: 'الاتحاد الأوروبي', region: 'major', popular: true },
  { code: 'GBP', symbol: '£', name: 'جنيه إسترليني', englishName: 'British Pound', flag: '🇬🇧', country: 'المملكة المتحدة', region: 'major', popular: true },
  { code: 'CHF', symbol: 'CHF', name: 'فرنك سويسري', englishName: 'Swiss Franc', flag: '🇨🇭', country: 'سويسرا', region: 'major', popular: true },
  { code: 'CAD', symbol: 'CA$', name: 'دولار كندي', englishName: 'Canadian Dollar', flag: '🇨🇦', country: 'كندا', region: 'major', popular: true },
  { code: 'AUD', symbol: 'AU$', name: 'دولار أسترالي', englishName: 'Australian Dollar', flag: '🇦🇺', country: 'أستراليا', region: 'major', popular: true },
  { code: 'JPY', symbol: '¥', name: 'ين ياباني', englishName: 'Japanese Yen', flag: '🇯🇵', country: 'اليابان', region: 'major', popular: true },
  { code: 'CNY', symbol: '¥', name: 'يوان صيني', englishName: 'Chinese Yuan', flag: '🇨🇳', country: 'الصين', region: 'major', popular: true },
  { code: 'NZD', symbol: 'NZ$', name: 'دولار نيوزيلندي', englishName: 'New Zealand Dollar', flag: '🇳🇿', country: 'نيوزيلندا', region: 'major' },
  { code: 'SGD', symbol: 'S$', name: 'دولار سنغافوري', englishName: 'Singapore Dollar', flag: '🇸🇬', country: 'سنغافورة', region: 'major' },
  { code: 'HKD', symbol: 'HK$', name: 'دولار هونغ كونغ', englishName: 'Hong Kong Dollar', flag: '🇭🇰', country: 'هونغ كونغ', region: 'major' },

  // ==========================================
  // 3. عملات آسيا والشرق الأوسط (Asia)
  // ==========================================
  { code: 'TRY', symbol: '₺', name: 'ليرة تركية', englishName: 'Turkish Lira', flag: '🇹🇷', country: 'تركيا', region: 'asia', popular: true },
  { code: 'INR', symbol: '₹', name: 'روبية هندية', englishName: 'Indian Rupee', flag: '🇮🇳', country: 'الهند', region: 'asia', popular: true },
  { code: 'PKR', symbol: '₨', name: 'روبية باكستانية', englishName: 'Pakistani Rupee', flag: '🇵🇰', country: 'باكستان', region: 'asia', popular: true },
  { code: 'MYR', symbol: 'RM', name: 'رينغيت ماليزي', englishName: 'Malaysian Ringgit', flag: '🇲🇾', country: 'ماليزيا', region: 'asia', popular: true },
  { code: 'IDR', symbol: 'Rp', name: 'روبية إندونيسية', englishName: 'Indonesian Rupiah', flag: '🇮🇩', country: 'إندونيسيا', region: 'asia' },
  { code: 'THB', symbol: '฿', name: 'بات تايلاندي', englishName: 'Thai Baht', flag: '🇹🇭', country: 'تايلاند', region: 'asia' },
  { code: 'KRW', symbol: '₩', name: 'وون كوري جنوبي', englishName: 'South Korean Won', flag: '🇰🇷', country: 'كوريا الجنوبية', region: 'asia' },
  { code: 'BDT', symbol: '৳', name: 'تاكا بنغلاديشية', englishName: 'Bangladeshi Taka', flag: '🇧🇩', country: 'بنغلاديش', region: 'asia' },
  { code: 'PHP', symbol: '₱', name: 'بيزو فلبيني', englishName: 'Philippine Peso', flag: '🇵🇭', country: 'الفلبين', region: 'asia' },
  { code: 'VND', symbol: '₫', name: 'دونغ فيتنامي', englishName: 'Vietnamese Dong', flag: '🇻🇳', country: 'فيتنام', region: 'asia' },
  { code: 'LKR', symbol: 'Rs', name: 'روبية سريلانكية', englishName: 'Sri Lankan Rupee', flag: '🇱🇰', country: 'سريلانكا', region: 'asia' },
  { code: 'NPR', symbol: '₨', name: 'روبية نيبالية', englishName: 'Nepalese Rupee', flag: '🇳🇵', country: 'نيبال', region: 'asia' },
  { code: 'KZT', symbol: '₸', name: 'تينغ كازاخستاني', englishName: 'Kazakhstani Tenge', flag: '🇰🇿', country: 'كازاخستان', region: 'asia' },
  { code: 'UZS', symbol: "so'm", name: 'سوم أوزبكستاني', englishName: 'Uzbekistani Som', flag: '🇺🇿', country: 'أوزبكستان', region: 'asia' },
  { code: 'AZN', symbol: '₼', name: 'مانات أذربيجاني', englishName: 'Azerbaijani Manat', flag: '🇦🇿', country: 'أذربيجان', region: 'asia' },
  { code: 'GEL', symbol: '₾', name: 'لاري جورجي', englishName: 'Georgian Lari', flag: '🇬🇪', country: 'جورجيا', region: 'asia' },
  { code: 'AMD', symbol: '֏', name: 'درام أرميني', englishName: 'Armenian Dram', flag: '🇦🇲', country: 'أرمينيا', region: 'asia' },
  { code: 'TJS', symbol: 'смн', name: 'سوموني طاجيكي', englishName: 'Tajikistani Somoni', flag: '🇹🇯', country: 'طاجيكستان', region: 'asia' },
  { code: 'AFN', symbol: '؋', name: 'أفغاني', englishName: 'Afghan Afghani', flag: '🇦🇫', country: 'أفغانستان', region: 'asia' },
  { code: 'MNT', symbol: '₮', name: 'توغروغ منغولي', englishName: 'Mongolian Tugrik', flag: '🇲🇳', country: 'منغوليا', region: 'asia' },

  // ==========================================
  // 4. عملات أوروبا (Europe)
  // ==========================================
  { code: 'SEK', symbol: 'kr', name: 'كرونة سويدية', englishName: 'Swedish Krona', flag: '🇸🇪', country: 'السويد', region: 'europe' },
  { code: 'NOK', symbol: 'kr', name: 'كرونة نرويجية', englishName: 'Norwegian Krone', flag: '🇳🇴', country: 'النرويج', region: 'europe' },
  { code: 'DKK', symbol: 'kr', name: 'كرونة دنماركية', englishName: 'Danish Krone', flag: '🇩🇰', country: 'الدنمارك', region: 'europe' },
  { code: 'PLN', symbol: 'zł', name: 'زلوتي بولندي', englishName: 'Polish Zloty', flag: '🇵🇱', country: 'بولندا', region: 'europe' },
  { code: 'HUF', symbol: 'Ft', name: 'فورنت مجري', englishName: 'Hungarian Forint', flag: '🇭🇺', country: 'المجر', region: 'europe' },
  { code: 'CZK', symbol: 'Kč', name: 'كرونة تشيكية', englishName: 'Czech Koruna', flag: '🇨🇿', country: 'جمهورية التشيك', region: 'europe' },
  { code: 'RON', symbol: 'lei', name: 'ليو روماني', englishName: 'Romanian Leu', flag: '🇷🇴', country: 'رومانيا', region: 'europe' },
  { code: 'BGN', symbol: 'лв', name: 'ليف بلغاري', englishName: 'Bulgarian Lev', flag: '🇧🇬', country: 'بلغاريا', region: 'europe' },
  { code: 'RSD', symbol: 'дин.', name: 'دينار صربي', englishName: 'Serbian Dinar', flag: '🇷🇸', country: 'صربيا', region: 'europe' },
  { code: 'BAM', symbol: 'KM', name: 'مارك بوسني', englishName: 'Bosnia-Herzegovina Mark', flag: '🇧🇦', country: 'البوسنة والهرسك', region: 'europe' },
  { code: 'ISK', symbol: 'kr', name: 'كرونة آيسلندية', englishName: 'Icelandic Krona', flag: '🇮🇸', country: 'آيسلندا', region: 'europe' },
  { code: 'RUB', symbol: '₽', name: 'روبل روسي', englishName: 'Russian Ruble', flag: '🇷🇺', country: 'روسيا', region: 'europe' },
  { code: 'UAH', symbol: '₴', name: 'هريفنيا أوكرانية', englishName: 'Ukrainian Hryvnia', flag: '🇺🇦', country: 'أوكرانيا', region: 'europe' },
  { code: 'BYN', symbol: 'Br', name: 'روبل بيلاروسي', englishName: 'Belarusian Ruble', flag: '🇧🇾', country: 'بيلاروسيا', region: 'europe' },
  { code: 'ALL', symbol: 'L', name: 'ليك ألباني', englishName: 'Albanian Lek', flag: '🇦🇱', country: 'ألبانيا', region: 'europe' },

  // ==========================================
  // 5. عملات الأمريكتين (Americas)
  // ==========================================
  { code: 'BRL', symbol: 'R$', name: 'ريال برازيلي', englishName: 'Brazilian Real', flag: '🇧🇷', country: 'البرازيل', region: 'americas', popular: true },
  { code: 'MXN', symbol: 'Mex$', name: 'بيزو مكسيكي', englishName: 'Mexican Peso', flag: '🇲🇽', country: 'المكسيك', region: 'americas' },
  { code: 'ARS', symbol: '$', name: 'بيزو أرجنتيني', englishName: 'Argentine Peso', flag: '🇦🇷', country: 'الأرجنتين', region: 'americas' },
  { code: 'CLP', symbol: '$', name: 'بيزو تشيلي', englishName: 'Chilean Peso', flag: '🇨🇱', country: 'تشيلي', region: 'americas' },
  { code: 'COP', symbol: '$', name: 'بيزو كولومبي', englishName: 'Colombian Peso', flag: '🇨🇴', country: 'كولومبيا', region: 'americas' },
  { code: 'PEN', symbol: 'S/', name: 'سول بيروفي', englishName: 'Peruvian Sol', flag: '🇵🇪', country: 'بيرو', region: 'americas' },
  { code: 'DOP', symbol: 'RD$', name: 'بيزو دومينيكاني', englishName: 'Dominican Peso', flag: '🇩🇴', country: 'جمهورية الدومينيكان', region: 'americas' },
  { code: 'CRC', symbol: '₡', name: 'كولون كوستاريكي', englishName: 'Costa Rican Colon', flag: '🇨🇷', country: 'كوستاريكا', region: 'americas' },
  { code: 'UYU', symbol: '$U', name: 'بيزو أوروغواي', englishName: 'Uruguayan Peso', flag: '🇺🇾', country: 'أوروغواي', region: 'americas' },
  { code: 'PYG', symbol: '₲', name: 'غواراني باراغواي', englishName: 'Paraguayan Guarani', flag: '🇵🇾', country: 'باراغواي', region: 'americas' },
  { code: 'VES', symbol: 'Bs.', name: 'بوليفار فنزويلي', englishName: 'Venezuelan Bolivar', flag: '🇻🇪', country: 'فنزويلا', region: 'americas' },
  { code: 'GTQ', symbol: 'Q', name: 'كيتزال غواتيمالي', englishName: 'Guatemalan Quetzal', flag: '🇬🇹', country: 'غواتيمالا', region: 'americas' },
  { code: 'JMD', symbol: 'J$', name: 'دولار جامايكي', englishName: 'Jamaican Dollar', flag: '🇯🇲', country: 'جامايكا', region: 'americas' },
  { code: 'TTD', symbol: 'TT$', name: 'دولار ترينيداد', englishName: 'Trinidad & Tobago Dollar', flag: '🇹🇹', country: 'ترينيداد وتوباغو', region: 'americas' },

  // ==========================================
  // 6. عملات إفريقيا (Africa)
  // ==========================================
  { code: 'ZAR', symbol: 'R', name: 'راند جنوب إفريقي', englishName: 'South African Rand', flag: '🇿🇦', country: 'جنوب إفريقيا', region: 'africa', popular: true },
  { code: 'NGN', symbol: '₦', name: 'نيرة نيجيرية', englishName: 'Nigerian Naira', flag: '🇳🇬', country: 'نيجيريا', region: 'africa', popular: true },
  { code: 'KES', symbol: 'KSh', name: 'شلن كيني', englishName: 'Kenyan Shilling', flag: '🇰🇪', country: 'كينيا', region: 'africa' },
  { code: 'GHS', symbol: 'GH₵', name: 'سيدي غاني', englishName: 'Ghanaian Cedi', flag: '🇬🇭', country: 'غانا', region: 'africa' },
  { code: 'ETB', symbol: 'Br', name: 'بير إثيوبي', englishName: 'Ethiopian Birr', flag: '🇪🇹', country: 'إثيوبيا', region: 'africa' },
  { code: 'TZS', symbol: 'TSh', name: 'شلن تنزاني', englishName: 'Tanzanian Shilling', flag: '🇹🇿', country: 'تنزانيا', region: 'africa' },
  { code: 'UGX', symbol: 'USh', name: 'شلن أوغندي', englishName: 'Ugandan Shilling', flag: '🇺🇬', country: 'أوغندا', region: 'africa' },
  { code: 'XOF', symbol: 'CFA', name: 'فرنك غرب إفريقيا', englishName: 'West African CFA Franc', flag: '🇸🇳', country: 'دول غرب إفريقيا', region: 'africa' },
  { code: 'XAF', symbol: 'FCFA', name: 'فرنك وسط إفريقيا', englishName: 'Central African CFA Franc', flag: '🇨🇲', country: 'دول وسط إفريقيا', region: 'africa' },
  { code: 'MGA', symbol: 'Ar', name: 'أرياري مدغشقري', englishName: 'Malagasy Ariary', flag: '🇲🇬', country: 'مدغشقر', region: 'africa' },
  { code: 'ZMW', symbol: 'ZK', name: 'كواشا زامبي', englishName: 'Zambian Kwacha', flag: '🇿🇲', country: 'زامبيا', region: 'africa' },
  { code: 'AOA', symbol: 'Kz', name: 'كوانزا أنغولية', englishName: 'Angolan Kwanza', flag: '🇦🇴', country: 'أنغولا', region: 'africa' },
  { code: 'RWF', symbol: 'FRw', name: 'فرنك رواندي', englishName: 'Rwandan Franc', flag: '🇷🇼', country: 'رواندا', region: 'africa' },
  { code: 'CDF', symbol: 'FC', name: 'فرنك كونغولي', englishName: 'Congolese Franc', flag: '🇨🇩', country: 'جمهورية الكونغو الديمقراطية', region: 'africa' },
  { code: 'MZN', symbol: 'MT', name: 'متكال موزمبيقي', englishName: 'Mozambican Metical', flag: '🇲🇿', country: 'موزمبيق', region: 'africa' },
  { code: 'MUR', symbol: '₨', name: 'روبية موريشيوسية', englishName: 'Mauritian Rupee', flag: '🇲🇺', country: 'موريشيوس', region: 'africa' },

  // ==========================================
  // 7. أوقيانوسيا وجزر المحيط الهادئ (Oceania)
  // ==========================================
  { code: 'FJD', symbol: 'FJ$', name: 'دولار فيجي', englishName: 'Fijian Dollar', flag: '🇫🇯', country: 'فيجي', region: 'oceania' },
  { code: 'PGK', symbol: 'K', name: 'كينا بابوا غينيا', englishName: 'Papua New Guinean Kina', flag: '🇵🇬', country: 'بابوا غينيا الجديدة', region: 'oceania' },
];

export const REGION_TABS = [
  { id: 'all', label: 'جميع عملات العالم', icon: '🌍' },
  { id: 'arab', label: 'العملات العربية والخليجية', icon: '🇸🇦' },
  { id: 'major', label: 'العملات العالمية الكبرى', icon: '💎' },
  { id: 'asia', label: 'آسيا والشرق الأوسط', icon: '🌏' },
  { id: 'europe', label: 'أوروبا', icon: '🇪🇺' },
  { id: 'americas', label: 'الأمريكتين', icon: '🌎' },
  { id: 'africa', label: 'إفريقيا', icon: '🌍' },
  { id: 'custom', label: 'عملة مخصصة', icon: '✨' },
];
