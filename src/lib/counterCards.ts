import { CounterCard, SituationId } from './types';

export const COUNTER_CARDS: Record<SituationId, CounterCard[]> = {
  konbini: [
    {
      id: 'k1',
      category: 'konbini',
      label: 'No Bag',
      japanese: '袋は大丈夫です。',
      romaji: 'Fu-ku-ro wa dai-jou-bu de-su.',
      english: 'No bag needed, thank you.',
      icon: ''
    },
    {
      id: 'k2',
      category: 'konbini',
      label: '1 Bag Please',
      japanese: '袋を一枚お願いします。',
      romaji: 'Fu-ku-ro o ichi-mai o-ne-gai-shi-ma-su.',
      english: 'One plastic bag please (~3-5 yen).',
      icon: ''
    },
    {
      id: 'k3',
      category: 'konbini',
      label: 'Please Microwave',
      japanese: 'お弁当を温めてください。',
      romaji: 'O-ben-tou o a-ta-ta-me-te ku-da-sai.',
      english: 'Please heat this up in the microwave.',
      icon: ''
    },
    {
      id: 'k4',
      category: 'konbini',
      label: 'Pay with Suica',
      japanese: '交通系IC（Suica）で払います。',
      romaji: 'Kou-tsuu-kei ai-shii (Sui-ka) de ha-ra-i-ma-su.',
      english: 'Paying with transit IC card / Suica.',
      icon: ''
    },
    {
      id: 'k5',
      category: 'konbini',
      label: 'Chopsticks Please',
      japanese: 'お箸を一膳お願いします。',
      romaji: 'O-ha-shi o ichi-zen o-ne-gai-shi-ma-su.',
      english: 'Could I get one pair of chopsticks please?',
      icon: ''
    },
    {
      id: 'k6',
      category: 'konbini',
      label: 'No Receipt',
      japanese: 'レシートは大丈夫です。',
      romaji: 'Re-shii-to wa dai-jou-bu de-su.',
      english: 'I do not need the receipt.',
      icon: ''
    }
  ],

  taxi: [
    {
      id: 't1',
      category: 'taxi',
      label: 'Take Toll Expressway',
      japanese: '高速道路を使ってください。',
      romaji: 'Kou-so-ku dou-ro o tsu-kat-te ku-da-sai.',
      english: 'Please take the toll expressway (Faster, ~800-1000 yen extra).',
      icon: ''
    },
    {
      id: 't2',
      category: 'taxi',
      label: 'No Expressway (Regular Road)',
      japanese: '一般道でお願いします。',
      romaji: 'Ip-pan-dou de o-ne-gai-shi-ma-su.',
      english: 'Please take regular roads (No toll fee).',
      icon: ''
    },
    {
      id: 't3',
      category: 'taxi',
      label: 'Drop Me Off Here',
      japanese: 'ここで降ろしてください。',
      romaji: 'Ko-ko de o-ro-shi-te ku-da-sai.',
      english: 'Please drop me off right here.',
      icon: ''
    },
    {
      id: 't4',
      category: 'taxi',
      label: 'Near the Entrance',
      japanese: '入り口の近くで止めてください。',
      romaji: 'I-ri-gu-chi no chi-ka-ku de to-me-te ku-da-sai.',
      english: 'Please stop as close to the entrance as possible.',
      icon: ''
    },
    {
      id: 't5',
      category: 'taxi',
      label: 'Receipt Please',
      japanese: '領収書をお願いします。',
      romaji: 'Ryou-shuu-sho o o-ne-gai-shi-ma-su.',
      english: 'May I have a receipt please?',
      icon: ''
    },
    {
      id: 't6',
      category: 'taxi',
      label: 'Open Trunk Please',
      japanese: 'トランクを開けていただけますか？',
      romaji: 'To-ran-ku o a-ke-te i-ta-da-ke-ma-su ka?',
      english: 'Could you please open the trunk for my luggage?',
      icon: ''
    }
  ],

  izakaya: [
    {
      id: 'i1',
      category: 'izakaya',
      label: 'Check Please',
      japanese: 'お会計をお願いします。',
      romaji: 'O-kai-kei o o-ne-gai-shi-ma-su.',
      english: 'Check please / Bill please.',
      icon: ''
    },
    {
      id: 'i2',
      category: 'izakaya',
      label: 'Cold Water Please',
      japanese: 'お冷をお願いします。',
      romaji: 'O-hi-ya o o-ne-gai-shi-ma-su.',
      english: 'Could we get cold water please? (Free in Japan)',
      icon: ''
    },
    {
      id: 'i3',
      category: 'izakaya',
      label: 'Eat-In (10% Tax)',
      japanese: '店内で食べます。',
      romaji: 'Ten-nai de ta-be-ma-su.',
      english: 'Eating inside (Standard 10% tax rate).',
      icon: ''
    },
    {
      id: 'i4',
      category: 'izakaya',
      label: 'Takeout (8% Tax)',
      japanese: 'お持ち帰りでお願いします。',
      romaji: 'O-mo-chi-ka-e-ri de o-ne-gai-shi-ma-su.',
      english: 'Takeout / To-go (Reduced 8% tax rate).',
      icon: ''
    },
    {
      id: 'i5',
      category: 'izakaya',
      label: 'Pay Separately',
      japanese: 'お会計は別々でできますか？',
      romaji: 'O-kai-kei wa bet-su-bet-su de de-ki-ma-su ka?',
      english: 'Can we pay separately?',
      icon: ''
    },
    {
      id: 'i6',
      category: 'izakaya',
      label: 'What is Recommended?',
      japanese: '一番人気のおすすめは何ですか？',
      romaji: 'Ichi-ban nin-ki no o-su-su-me wa nan de-su ka?',
      english: 'What is your most popular recommendation?',
      icon: ''
    }
  ],

  train: [
    {
      id: 'tr1',
      category: 'train',
      label: 'IC Card Gate Error',
      japanese: '改札でエラーが出ました。見ていただけますか？',
      romaji: 'Kai-sa-tsu de e-raa ga de-ma-shi-ta. Mi-te i-ta-da-ke-ma-su ka?',
      english: 'My transit card gave an error at the gate. Could you check it?',
      icon: ''
    },
    {
      id: 'tr2',
      category: 'train',
      label: 'Which Platform?',
      japanese: '何番線から乗ればいいですか？',
      romaji: 'Nan-ban-sen ka-ra no-re-ba ii de-su ka?',
      english: 'Which platform / track number should I get on?',
      icon: ''
    },
    {
      id: 'tr3',
      category: 'train',
      label: 'Non-Reserved Cars?',
      japanese: '自由席は何号車ですか？',
      romaji: 'Ji-yuu-se-ki wa nan-gou-sha de-su ka?',
      english: 'Which cars are the non-reserved seats?',
      icon: ''
    },
    {
      id: 'tr4',
      category: 'train',
      label: 'Fare Adjustment Machine?',
      japanese: 'のりこし精算機はどこですか？',
      romaji: 'No-ri-ko-shi sei-san-ki wa do-ko de-su ka?',
      english: 'Where is the fare adjustment machine to top up?',
      icon: ''
    }
  ],

  ramen: [
    {
      id: 'r1',
      category: 'ramen',
      label: 'Firm Noodles',
      japanese: '麺硬めでお願いします。',
      romaji: 'Men ka-ta-me de o-ne-gai-shi-ma-su.',
      english: 'Noodles firm / al dente please.',
      icon: ''
    },
    {
      id: 'r2',
      category: 'ramen',
      label: 'Noodle Refill (Kaedama)',
      japanese: '替え玉をひとつお願いします！',
      romaji: 'Kae-da-ma o hi-to-tsu o-ne-gai-shi-ma-su!',
      english: 'One noodle refill please! (Leave broth in bowl)',
      icon: ''
    },
    {
      id: 'r3',
      category: 'ramen',
      label: 'Water Refill',
      japanese: 'お冷をお願いします。',
      romaji: 'O-hi-ya o o-ne-gai-shi-ma-su.',
      english: 'Could I get water please?',
      icon: ''
    },
    {
      id: 'r4',
      category: 'ramen',
      label: 'Thanks for the Feast',
      japanese: 'ごちそうさまでした！',
      romaji: 'Go-chi-sou-sa-ma de-shi-ta!',
      english: 'Thank you for the delicious meal! (Said when leaving)',
      icon: ''
    }
  ],

  hotel: [
    {
      id: 'h1',
      category: 'hotel',
      label: 'Check In',
      japanese: 'チェックインをお願いします。予約があります。',
      romaji: 'Chek-ku-in o o-ne-gai-shi-ma-su. Yo-ya-ku ga a-ri-ma-su.',
      english: 'Check-in please. I have a reservation.',
      icon: ''
    },
    {
      id: 'h2',
      category: 'hotel',
      label: 'Hold Luggage',
      japanese: 'チェックインまで荷物を預かっていただけますか？',
      romaji: 'Chek-ku-in ma-de ni-mo-tsu o a-zu-kat-te i-ta-da-ke-ma-su ka?',
      english: 'Could you please hold our luggage until check-in time?',
      icon: ''
    },
    {
      id: 'h3',
      category: 'hotel',
      label: 'Call a Taxi',
      japanese: 'タクシーを一台呼んでいただけますか？',
      romaji: 'Ta-ku-shii o ichi-dai yon-de i-ta-da-ke-ma-su ka?',
      english: 'Could you please call a taxi for us to the entrance?',
      icon: ''
    },
    {
      id: 'h4',
      category: 'hotel',
      label: 'Late Checkout',
      japanese: 'レイトチェックアウトは可能ですか？',
      romaji: 'Rei-to chek-ku-au-to wa ka-nou de-su ka?',
      english: 'Is late check-out available? (Usually small fee per hour)',
      icon: ''
    }
  ],

  shopping: [
    {
      id: 's1',
      category: 'shopping',
      label: 'Tax-Free Available?',
      japanese: '免税手続きはできますか？',
      romaji: 'Men-zei te-tsu-zu-ki wa de-ki-ma-su ka?',
      english: 'Can I do tax-free exemption here? (Minimum 5000 JPY)',
      icon: ''
    },
    {
      id: 's2',
      category: 'shopping',
      label: 'May I Try This On?',
      japanese: '試着してもよろしいですか？',
      romaji: 'Shi-cha-ku shi-te-mo yo-ro-shii de-su ka?',
      english: 'May I try this on in the fitting room? (Remove shoes before stepping in)',
      icon: ''
    },
    {
      id: 's3',
      category: 'shopping',
      label: 'Different Size / Color?',
      japanese: '別のサイズや色はありますか？',
      romaji: 'Bet-su no sai-zu ya i-ro wa a-ri-ma-su ka?',
      english: 'Do you have another size or color in stock?',
      icon: ''
    },
    {
      id: 's4',
      category: 'shopping',
      label: 'Just Looking',
      japanese: '見ているだけです。ありがとうございます。',
      romaji: 'Mi-te i-ru da-ke de-su. A-ri-ga-tou go-zai-ma-su.',
      english: 'Just looking around, thank you! (Polite brush-off to staff)',
      icon: ''
    }
  ],

  pharmacy: [
    {
      id: 'p1',
      category: 'pharmacy',
      label: 'Headache Medicine',
      japanese: '頭痛薬（鎮痛剤）はありますか？',
      romaji: 'Zu-tsuu-ya-ku (chin-tsuu-zai) wa a-ri-ma-su ka?',
      english: 'Do you have headache medicine / painkillers like ibuprofen?',
      icon: ''
    },
    {
      id: 'p2',
      category: 'pharmacy',
      label: 'Stomach Pain',
      japanese: '胃薬（お腹の薬）はどれですか？',
      romaji: 'I-gu-su-ri (o-na-ka no ku-su-ri) wa do-re de-su ka?',
      english: 'Which one is for stomach pain or acid indigestion?',
      icon: ''
    },
    {
      id: 'p3',
      category: 'pharmacy',
      label: 'Motion Sickness',
      japanese: '乗り物酔いの薬はありますか？',
      romaji: 'No-ri-mo-no-yoi no ku-su-ri wa a-ri-ma-su ka?',
      english: 'Do you have motion sickness pills for cars or boats?',
      icon: ''
    },
    {
      id: 'p4',
      category: 'pharmacy',
      label: 'Non-Drowsy Medicine?',
      japanese: '眠くならない薬はありますか？',
      romaji: 'Ne-mu-ku na-ra-nai ku-su-ri wa a-ri-ma-su ka?',
      english: 'Is there a non-drowsy version available?',
      icon: ''
    }
  ],

  general: [
    {
      id: 'g1',
      category: 'general',
      label: 'Where is Restroom?',
      japanese: 'お手洗いはどこですか？',
      romaji: 'O-te-a-ra-i wa do-ko de-su ka?',
      english: 'Where is the restroom? (Polite phrasing)',
      icon: ''
    },
    {
      id: 'g2',
      category: 'general',
      label: 'Could You Take a Photo?',
      japanese: '写真を撮っていただけますか？',
      romaji: 'Sha-shin o tot-te i-ta-da-ke-ma-su ka?',
      english: 'Could you please take a photo of us?',
      icon: ''
    },
    {
      id: 'g3',
      category: 'general',
      label: 'English Menu?',
      japanese: '英語のメニューはありますか？',
      romaji: 'Ei-go no me-nyuu wa a-ri-ma-su ka?',
      english: 'Do you have an English menu available?',
      icon: ''
    },
    {
      id: 'g4',
      category: 'general',
      label: 'Where is Trash Can?',
      japanese: 'ゴミ箱はどこにありますか？',
      romaji: 'Go-mi-ba-ko wa do-ko ni a-ri-ma-su ka?',
      english: 'Where can I find a trash can?',
      icon: ''
    }
  ]
};
