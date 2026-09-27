import { SituationConfig, SituationId } from './types';

export const SITUATIONS: Record<SituationId, SituationConfig> = {
  konbini: {
    id: 'konbini',
    name: 'Konbini',
    japaneseName: 'コンビニ',
    icon: 'konbini',
    badge: 'Convenience Store',
    description: '7-Eleven, Lawson, FamilyMart. Fast transactions, bags, bento heating, point cards.',
    commonPhrasesToExpect: [
      {
        japanese: '袋はご利用ですか？',
        romaji: 'Fu-ku-ro wa go-ri-you de-su ka?',
        english: 'Do you need a plastic bag? (Costs 3-5 yen)',
        tip: 'Reply "Daijoubu desu" if no, or "Onegaishimasu" if yes.'
      },
      {
        japanese: '温めますか？',
        romaji: 'A-ta-ta-me-ma-su ka?',
        english: 'Should I heat up your food/bento?',
        tip: 'Reply "Onegaishimasu" to microwave it right now.'
      },
      {
        japanese: 'ポイントカードはお持ちですか？',
        romaji: 'Po-in-to kaa-do wa o-mo-chi de-su ka?',
        english: 'Do you have a store loyalty/point card?',
        tip: 'Tourists rarely do. Reply "Nai desu" (I don\'t have one).'
      },
      {
        japanese: '画面の確認ボタンを押してください',
        romaji: 'Ga-men no ka-ku-nin bo-tan o o-shi-te ku-da-sai',
        english: 'Please press the age confirmation button on the screen.',
        tip: 'Tap the glowing yellow button on the cash register screen when buying beer/wine.'
      }
    ],
    quickActions: [
      { label: 'No bag needed', english: 'No bag needed, thank you.', japanese: '袋は大丈夫です。', romaji: 'Fukuro wa daijoubu desu.', situation: 'konbini' },
      { label: 'Heat it please', english: 'Please heat this up.', japanese: '温めてください。', romaji: 'Atatamete kudasai.', situation: 'konbini' },
      { label: 'Pay with Suica', english: 'Payment with Suica please.', japanese: 'Suicaでお願いします。', romaji: 'Suika de onegaishimasu.', situation: 'konbini' },
      { label: 'Chopsticks please', english: 'Could I get chopsticks please?', japanese: 'お箸をお願いします。', romaji: 'Ohashi o onegaishimasu.', situation: 'konbini' }
    ],
    systemPromptContext: `SITUATION: Convenience Store (Konbini: 7-Eleven, FamilyMart, Lawson).
Local clerks speak fast baito-keigo formulas with omitted subjects.
Key questions to expect from clerks:
- "Fukuro wa goriyou desu ka?" / "Fukuro wa yoroshii desu ka?" -> Do you need a plastic bag? (costs 3-5 yen).
- "Obento atatamemasu ka?" -> Should I heat up the lunchbox?
- "Ohashi/supuun/fooku wa nanzen tsukemasu ka?" -> How many chopsticks/spoons/forks?
- "Pointo kaado omochi desu ka?" -> Do you have a store loyalty/point card?
- "Gamen no kakunin botan o oshite kudasai" -> Please press age confirmation on register screen.`
  },
  izakaya: {
    id: 'izakaya',
    name: 'Dining & Izakaya',
    japaneseName: '居酒屋・飲食店',
    icon: 'izakaya',
    badge: 'Food & Drinks',
    description: 'Ordering food, calling servers, otoshi cover charge, dietary questions, splitting the bill.',
    commonPhrasesToExpect: [
      {
        japanese: '何名様ですか？',
        romaji: 'Nan-mei-sa-ma de-su ka?',
        english: 'How many people in your party?',
        tip: 'Show fingers or say "Futari desu" (2 people), "Hitori desu" (1 person).'
      },
      {
        japanese: 'お飲み物はお決まりですか？',
        romaji: 'O-no-mi-mo-no wa o-ki-ma-ri de-su ka?',
        english: 'Have you decided on drinks?',
        tip: 'In Japan, drinks are ordered first before food. "Toriaezu biiru" = beer first.'
      },
      {
        japanese: 'ラストオーダーになりますが...',
        romaji: 'Ra-su-to oo-daa ni na-ri-ma-su ga...',
        english: 'This is the last call for food/drinks.',
        tip: 'Usually 30-45 mins before closing. Last chance to order.'
      },
      {
        japanese: 'お会計はご一緒でよろしいですか？',
        romaji: 'O-kai-kei wa go-is-sho de yo-ro-shii de-su ka?',
        english: 'Are you paying together on one bill?',
        tip: 'Reply "Hai, issho de" (Yes, together) or "Betsu-betsu de" (Separate).'
      }
    ],
    quickActions: [
      { label: 'Table for 2', english: 'Table for two people please.', japanese: '二人です。', romaji: 'Futari desu.', situation: 'izakaya' },
      { label: 'Check please', english: 'Check please.', japanese: 'お会計をお願いします。', romaji: 'Okaikei o onegaishimasu.', situation: 'izakaya' },
      { label: 'Call server', english: 'Excuse me!', japanese: 'すみません！', romaji: 'Sumimasen!', situation: 'izakaya' },
      { label: 'Recommendation?', english: 'What do you recommend?', japanese: 'おすすめは何ですか？', romaji: 'Osusume wa nan desu ka?', situation: 'izakaya' }
    ],
    systemPromptContext: `SITUATION: Japanese Restaurant / Izakaya / Bar.
Crucial cultural mechanics:
- Otoshi: Small mandatory table snack / seating fee (300-600 yen).
- Calling staff: Raising a hand with "Sumimasen!" is polite and expected.
- "Rasuto oodaa" (Last order): 30-45 min before closing.
- "Betsu-betsu de" (separate payments).`
  },
  train: {
    id: 'train',
    name: 'Train & Transit',
    japaneseName: '電車・新幹線',
    icon: 'train',
    badge: 'Station & Transit',
    description: 'IC card gates, Shinkansen reserved seats, platform transfers, lost luggage.',
    commonPhrasesToExpect: [
      {
        japanese: '何番線ですか？',
        romaji: 'Nan-ban-sen de-su ka?',
        english: 'Which platform is it?',
        tip: 'Ask station staff at the gate window if confused about train tracks.'
      },
      {
        japanese: 'チャージしてください',
        romaji: 'Chaa-ji shi-te ku-da-sai',
        english: 'Please top-up / add money to your IC card.',
        tip: 'If gate gate beeps "pin-pon", your Suica/Pasmo balance is under the minimum fare.'
      },
      {
        japanese: '指定席ですか、自由席ですか？',
        romaji: 'Shi-tei-se-ki de-su ka, ji-yuu-se-ki de-su ka?',
        english: 'Reserved seat or non-reserved seat?',
        tip: 'Shinkansen: Cars 1-3 are usually non-reserved (Jiyuuseki).'
      }
    ],
    quickActions: [
      { label: 'Which platform?', english: 'Which platform goes to Shibuya?', japanese: '渋谷行きは何番線ですか？', romaji: 'Shibuya-yuki wa nanban-sen desu ka?', situation: 'train' },
      { label: 'Ticket gate trouble', english: 'My IC card gave an error at the gate.', japanese: '改札でタッチできませんでした。', romaji: 'Kaisatsu de tacchi dekimasen deshita.', situation: 'train' },
      { label: 'Reserved seat?', english: 'Is this car reserved or non-reserved?', japanese: 'これは指定席ですか、自由席ですか？', romaji: 'Kore wa shiteiseki desu ka, jiyuuseki desu ka?', situation: 'train' },
      { label: 'Transfer time', english: 'How many minutes for the transfer?', japanese: '乗り換え時間は何分ですか？', romaji: 'Norikae jikan wa nanpun desu ka?', situation: 'train' }
    ],
    systemPromptContext: `SITUATION: Train Station, Subway, or Shinkansen.`
  },
  ramen: {
    id: 'ramen',
    name: 'Ramen Counter',
    japaneseName: 'ラーメン・食券',
    icon: 'ramen',
    badge: 'Counter Dining',
    description: 'Ticket vending machines, noodle firmness (katame), broth thickness, counter manners.',
    commonPhrasesToExpect: [
      {
        japanese: '食券をお預かりします',
        romaji: 'Shok-ken o o-a-zu-ka-ri shi-ma-su',
        english: 'I will take your food ticket now.',
        tip: 'Hand your paper vending machine ticket to the chef over the counter.'
      },
      {
        japanese: '麺の硬さはいかがですか？',
        romaji: 'Men no ka-ta-sa wa i-ka-ga de-su ka?',
        english: 'How firm would you like your noodles?',
        tip: 'Say "Katame" (firm) or "Futsuu" (normal).'
      },
      {
        japanese: 'ニンニク入れますか？',
        romaji: 'Nin-ni-ku i-re-ma-su ka?',
        english: 'Would you like garlic added?',
        tip: 'Standard question at Ramen Jiro and many garlic-heavy tonkotsu ramen counters.'
      }
    ],
    quickActions: [
      { label: 'Firm noodles', english: 'Noodles firm please.', japanese: '麺硬めでお願いします。', romaji: 'Men katame de onegaishimasu.', situation: 'ramen' },
      { label: 'Water refill', english: 'Could I get water please? (Usually self-serve)', japanese: 'お冷をお願いします。', romaji: 'Ohie o onegaishimasu.', situation: 'ramen' },
      { label: 'Extra egg', english: 'I want to add a seasoned egg.', japanese: '味玉を追加したいです。', romaji: 'Ajitama o tsuika shitai desu.', situation: 'ramen' },
      { label: 'Kaedama (Noodle refill)', english: 'One noodle refill please!', japanese: '替え玉お願いします！', romaji: 'Kaedama onegaishimasu!', situation: 'ramen' }
    ],
    systemPromptContext: `SITUATION: Ramen Shop / Shokkenki.`
  },
  taxi: {
    id: 'taxi',
    name: 'Taxi',
    japaneseName: 'タクシー',
    icon: 'taxi',
    badge: 'Street Taxi',
    description: 'Automatic doors, destinations, landmarks, drop-offs, payment.',
    commonPhrasesToExpect: [
      {
        japanese: 'どちらまで行かれますか？',
        romaji: 'Do-chi-ra ma-de i-ka-re-ma-su ka?',
        english: 'Where are you heading to?',
        tip: 'State destination: "[Location] made onegaishimasu" or show phone map.'
      },
      {
        japanese: 'ここでよろしいですか？',
        romaji: 'Ko-ko de yo-ro-shii de-su ka?',
        english: 'Is here good to drop you off?',
        tip: 'Reply "Daijoubu desu" (Here is fine).'
      }
    ],
    quickActions: [
      { label: 'To station please', english: 'To Tokyo Station please.', japanese: '東京駅までお願いします。', romaji: 'Toukyou-eki made onegaishimasu.', situation: 'taxi' },
      { label: 'Drop me here', english: 'Please drop me off right here.', japanese: 'ここで降ろしてください。', romaji: 'Koko de oroshite kudasai.', situation: 'taxi' },
      { label: 'Near the entrance', english: 'Please stop near the entrance.', japanese: '入り口の近くで止めてください。', romaji: 'Iriguchi no chikaku de tomete kudasai.', situation: 'taxi' },
      { label: 'Receipt please', english: 'May I have a receipt please?', japanese: '領収書をお願いします。', romaji: 'Ryoushuusho o onegaishimasu.', situation: 'taxi' }
    ],
    systemPromptContext: `SITUATION: Japanese Taxi.`
  },
  hotel: {
    id: 'hotel',
    name: 'Hotel & Ryokan',
    japaneseName: 'ホテル・旅館',
    icon: 'hotel',
    badge: 'Accommodation',
    description: 'Check-in, luggage forwarding (takkyubin), breakfast, onsen rules, shoe removal.',
    commonPhrasesToExpect: [
      {
        japanese: 'チェックインでございますか？',
        romaji: 'Chek-ku-in de go-zai-ma-su ka?',
        english: 'Are you checking in?',
        tip: 'Have your passport and booking reservation name ready.'
      },
      {
        japanese: 'ご署名をお願いいたします',
        romaji: 'Go-sho-mei o o-ne-gai i-ta-shi-ma-su',
        english: 'Please sign here.',
        tip: 'Sign registration card with your name and home address.'
      },
      {
        japanese: '朝食券でございます',
        romaji: 'Chou-sho-ku-ken de go-zai-ma-su',
        english: 'Here is your breakfast voucher.',
        tip: 'Bring this ticket to the dining hall in the morning.'
      }
    ],
    quickActions: [
      { label: 'Check in', english: 'Check in please, I have a reservation.', japanese: 'チェックインお願いします。予約しています。', romaji: 'Chekkuin onegaishimasu. Yoyaku shite imasu.', situation: 'hotel' },
      { label: 'Hold luggage', english: 'Can you hold my luggage until check-in?', japanese: 'チェックインまで荷物を預かっていただけますか？', romaji: 'Chekkuin made nimotsu o azukatte itadakemasu ka?', situation: 'hotel' },
      { label: 'Luggage delivery', english: 'I want to send my luggage to another hotel (Takkyubin).', japanese: '荷物を次のホテルに送りたいです。', romaji: 'Nimotsu o tsugi no hoteru ni okuritai desu.', situation: 'hotel' },
      { label: 'Tattoo policy', english: 'Are tattoos allowed in the public bath?', japanese: '大浴場はタトゥーがあっても入れますか？', romaji: 'Daiyokujou wa tatuu ga attemo hairemasu ka?', situation: 'hotel' }
    ],
    systemPromptContext: `SITUATION: Hotel, Ryokan, or Onsen.`
  },
  shopping: {
    id: 'shopping',
    name: 'Tax-Free Shopping',
    japaneseName: '免税・買い物',
    icon: 'shopping',
    badge: 'Retail & Tax-Free',
    description: 'Tax exemption (menzei), passport check, sizes, stock, sealed duty-free bag rules.',
    commonPhrasesToExpect: [
      {
        japanese: 'パスポートはお持ちですか？',
        romaji: 'Pa-su-poo-to wa o-mo-chi de-su ka?',
        english: 'Do you have your physical passport?',
        tip: 'Required for tax-free exemption over 5,000 JPY. Photos/copies usually rejected.'
      },
      {
        japanese: '日本を出るまで袋を開けないでください',
        romaji: 'Ni-hon o de-ru ma-de fu-ku-ro o a-ke-nai de ku-da-sai',
        english: 'Do not open this sealed bag until departing Japan.',
        tip: 'Consumable tax-free items (snacks, skincare, medicine) are sealed in duty-free bags.'
      }
    ],
    quickActions: [
      { label: 'Is this tax-free?', english: 'Is tax-free shopping available here?', japanese: 'ここは免税できますか？', romaji: 'Koko wa menzei dekimasu ka?', situation: 'shopping' },
      { label: 'Try this on?', english: 'May I try this on?', japanese: '試着してもいいですか？', romaji: 'Shichaku shitemo ii desu ka?', situation: 'shopping' },
      { label: 'Different size?', english: 'Do you have a different size or color?', japanese: '別のサイズや色はありますか？', romaji: 'Betsu no saizu ya iro wa arimasu ka?', situation: 'shopping' },
      { label: 'Looking around', english: 'I am just browsing, thank you.', japanese: '見ているだけです。ありがとうございます。', romaji: 'Mite iru dake desu. Arigatou gozaimasu.', situation: 'shopping' }
    ],
    systemPromptContext: `SITUATION: Shopping & Tax-Free in Japan.`
  },
  pharmacy: {
    id: 'pharmacy',
    name: 'Pharmacy & Health',
    japaneseName: '薬局・健康',
    icon: 'pharmacy',
    badge: 'Drugstore & Medical',
    description: 'Drugstores (Matsumoto Kiyoshi), describing symptoms, fever, pain, allergies.',
    commonPhrasesToExpect: [
      {
        japanese: 'どのような症状ですか？',
        romaji: 'Do-no you-na shou-jou de-su ka?',
        english: 'What kind of symptoms do you have?',
        tip: 'Point to where it hurts or state fever (netsu), headache (zutsuu).'
      },
      {
        japanese: '熱はありますか？',
        romaji: 'Ne-tsu wa a-ri-ma-su ka?',
        english: 'Do you have a fever?',
        tip: 'Reply "Hai" (Yes) or "Iie" (No).'
      }
    ],
    quickActions: [
      { label: 'Headache medicine', english: 'Do you have headache medicine (like painkillers)?', japanese: '頭痛薬はありますか？', romaji: 'Zutsuuyaku wa arimasu ka?', situation: 'pharmacy' },
      { label: 'Stomach pain', english: 'My stomach hurts, what medicine do you recommend?', japanese: '胃が痛いのですが、おすすめの薬はありますか？', romaji: 'I ga itai no desu ga, osusume no kusuri wa arimasu ka?', situation: 'pharmacy' },
      { label: 'Bandages', english: 'Where are the bandages / band-aids?', japanese: '絆創膏はどこですか？', romaji: 'Bansoukou wa doko desu ka?', situation: 'pharmacy' },
      { label: 'Motion sickness', english: 'Do you have motion sickness pills?', japanese: '乗り物酔いの薬はありますか？', romaji: 'Norimonoyoi no kusuri wa arimasu ka?', situation: 'pharmacy' }
    ],
    systemPromptContext: `SITUATION: Japanese Drugstore.`
  },
  general: {
    id: 'general',
    name: 'General Exploration',
    japaneseName: '日常・街歩き',
    icon: 'general',
    badge: 'Street & Sightseeing',
    description: 'Sightseeing, asking directions, photos, general polite interactions.',
    commonPhrasesToExpect: [
      {
        japanese: 'いらっしゃいませ！',
        romaji: 'I-ras-shai-ma-se!',
        english: 'Welcome to the shop!',
        tip: 'You do NOT need to say anything back. A polite slight nod is enough.'
      },
      {
        japanese: 'ありがとうございました！',
        romaji: 'A-ri-ga-tou go-zai-ma-shi-ta!',
        english: 'Thank you very much (for visiting/buying)!',
        tip: 'You can say "Arigatou gozaimasu" or "Gochisousama deshita" when leaving.'
      }
    ],
    quickActions: [
      { label: 'Take a photo?', english: 'Could you please take a photo for us?', japanese: '写真を撮っていただけますか？', romaji: 'Shashin o totte itadakemasu ka?', situation: 'general' },
      { label: 'Where is restroom?', english: 'Where is the restroom?', japanese: 'お手洗いはどこですか？', romaji: 'Otearai wa doko desu ka?', situation: 'general' },
      { label: 'English menu?', english: 'Do you have an English menu?', japanese: '英語のメニューはありますか？', romaji: 'Eigo no menyuu wa arimasu ka?', situation: 'general' },
      { label: 'Trash can?', english: 'Where can I throw this away? (Trash cans are rare in Japan)', japanese: 'ゴミ箱はどこにありますか？', romaji: 'Gomibako wa doko ni arimasu ka?', situation: 'general' }
    ],
    systemPromptContext: `SITUATION: General Travel / Street Exploration in Japan.`
  }
};
