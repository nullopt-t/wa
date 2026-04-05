const API_URL = process.env.API_URL || 'http://localhost:4001';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQHdhZXkuY29tIiwic3ViIjoiNjlkMGYyNTIzMWI3MTIxNzk5NjYxZjg3Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc1MzMwODQ1LCJleHAiOjE3NzU5MzU2NDV9.W9FiuxIk3Dle2h2hh24fJGds8ycsQrVQ02JzPAHk_kc';

const journeys = [
  {
    name: 'رحلة الوعي النفسي',
    description: 'رحلة تعليمية مكونة من 4 مستويات لاكتساب الوعي النفسي خطوة بخطوة',
    longDescription: 'هذه الرحلة مصممة لمساعدتك على فهم صحتك النفسية بشكل تدريجي. كل مستوى يركز على جوانب مختلفة من الوعي الذاتي والصحة النفسية. يجب إكمال جميع الموارد في كل مستوى قبل الانتقال إلى المستوى التالي.',
    isActive: true,
    icon: 'fa-solid fa-road',
    color: '#8B5CF6',
    estimatedDuration: 30,
    levels: [
      {
        levelNumber: 1,
        name: 'البداية: فهم الذات',
        description: 'تعرف على أساسيات الصحة النفسية والوعي الذاتي',
        order: 1,
        requiredCompletions: 2,
        color: '#F59E0B',
        icon: 'fa-solid fa-seedling',
        resources: [
          {
            resourceType: 'article',
            resourceId: '000000000000000000000001',
            isMandatory: true,
            order: 1,
          },
          {
            resourceType: 'video',
            resourceId: '000000000000000000000002',
            isMandatory: true,
            order: 2,
          },
          {
            resourceType: 'book',
            resourceId: '000000000000000000000003',
            isMandatory: false,
            order: 3,
          },
        ],
      },
      {
        levelNumber: 2,
        name: 'التعمق: المشاعر والأفكار',
        description: 'تعلم كيف تتعرف على مشاعرك وأفكارك بوضوح أكبر',
        order: 2,
        requiredCompletions: 2,
        color: '#10B981',
        icon: 'fa-solid fa-heart',
        resources: [
          {
            resourceType: 'article',
            resourceId: '000000000000000000000004',
            isMandatory: true,
            order: 1,
          },
          {
            resourceType: 'video',
            resourceId: '000000000000000000000005',
            isMandatory: true,
            order: 2,
          },
          {
            resourceType: 'article',
            resourceId: '000000000000000000000006',
            isMandatory: false,
            order: 3,
          },
        ],
      },
      {
        levelNumber: 3,
        name: 'الممارسة: أدوات وتقنيات',
        description: 'اكتسب أدوات عملية للتعامل مع التحديات النفسية',
        order: 3,
        requiredCompletions: 2,
        color: '#3B82F6',
        icon: 'fa-solid fa-toolbox',
        resources: [
          {
            resourceType: 'video',
            resourceId: '000000000000000000000007',
            isMandatory: true,
            order: 1,
          },
          {
            resourceType: 'book',
            resourceId: '000000000000000000000008',
            isMandatory: true,
            order: 2,
          },
          {
            resourceType: 'article',
            resourceId: '000000000000000000000009',
            isMandatory: false,
            order: 3,
          },
        ],
      },
      {
        levelNumber: 4,
        name: 'الإتقان: النمو المستمر',
        description: 'حقق الوعي الكامل وتعلم كيف تحافظ على نموك النفسي',
        order: 4,
        requiredCompletions: 2,
        color: '#8B5CF6',
        icon: 'fa-solid fa-star',
        resources: [
          {
            resourceType: 'article',
            resourceId: '000000000000000000000010',
            isMandatory: true,
            order: 1,
          },
          {
            resourceType: 'video',
            resourceId: '000000000000000000000011',
            isMandatory: true,
            order: 2,
          },
          {
            resourceType: 'book',
            resourceId: '000000000000000000000012',
            isMandatory: false,
            order: 3,
          },
        ],
      },
    ],
  },
  {
    name: 'رحلة التغلب على القلق',
    description: 'رحلة متخصصة لفهم القلق وإدارته والتغلب عليه تدريجياً',
    longDescription: 'رحلة تعليمية شاملة مصممة خصيصاً لمساعدتك على فهم القلق وأسبابه، وتعلم تقنيات عملية للتعامل معه، وبناء حياة أكثر هدوءاً وسلاماً داخلياً.',
    isActive: false,
    icon: 'fa-solid fa-shield-heart',
    color: '#10B981',
    estimatedDuration: 21,
    levels: [
      {
        levelNumber: 1,
        name: 'فهم القلق',
        description: 'تعرف على القلق وأسبابه وأعراضه المختلفة',
        order: 1,
        requiredCompletions: 2,
        color: '#F59E0B',
        icon: 'fa-solid fa-circle-question',
        resources: [
          {
            resourceType: 'article',
            resourceId: '000000000000000000000013',
            isMandatory: true,
            order: 1,
          },
          {
            resourceType: 'video',
            resourceId: '000000000000000000000014',
            isMandatory: true,
            order: 2,
          },
          {
            resourceType: 'article',
            resourceId: '000000000000000000000015',
            isMandatory: false,
            order: 3,
          },
        ],
      },
      {
        levelNumber: 2,
        name: 'تقنيات الاسترخاء',
        description: 'تعلم تقنيات التنفس والاسترخاء العضلي والتأمل',
        order: 2,
        requiredCompletions: 2,
        color: '#10B981',
        icon: 'fa-solid fa-spa',
        resources: [
          {
            resourceType: 'video',
            resourceId: '000000000000000000000016',
            isMandatory: true,
            order: 1,
          },
          {
            resourceType: 'video',
            resourceId: '000000000000000000000017',
            isMandatory: true,
            order: 2,
          },
          {
            resourceType: 'book',
            resourceId: '000000000000000000000018',
            isMandatory: false,
            order: 3,
          },
        ],
      },
      {
        levelNumber: 3,
        name: 'إعادة صياغة الأفكار',
        description: 'تعلم كيف تتعرف على الأفكار السلبية وتحولها',
        order: 3,
        requiredCompletions: 2,
        color: '#3B82F6',
        icon: 'fa-solid fa-brain',
        resources: [
          {
            resourceType: 'article',
            resourceId: '000000000000000000000019',
            isMandatory: true,
            order: 1,
          },
          {
            resourceType: 'book',
            resourceId: '000000000000000000000020',
            isMandatory: true,
            order: 2,
          },
          {
            resourceType: 'video',
            resourceId: '000000000000000000000021',
            isMandatory: false,
            order: 3,
          },
        ],
      },
      {
        levelNumber: 4,
        name: 'بناء حياة هادئة',
        description: 'طبّق ما تعلمته لبناء روتين يومي يدعم هدوءك النفسي',
        order: 4,
        requiredCompletions: 2,
        color: '#8B5CF6',
        icon: 'fa-solid fa-dove',
        resources: [
          {
            resourceType: 'article',
            resourceId: '000000000000000000000022',
            isMandatory: true,
            order: 1,
          },
          {
            resourceType: 'video',
            resourceId: '000000000000000000000023',
            isMandatory: true,
            order: 2,
          },
          {
            resourceType: 'book',
            resourceId: '000000000000000000000024',
            isMandatory: false,
            order: 3,
          },
        ],
      },
    ],
  },
];

async function seedJourneys() {
  for (const journey of journeys) {
    try {
      // First check if an active journey exists
      const checkRes = await fetch(`${API_URL}/api/journey`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (journey.isActive && checkRes.ok) {
        console.log(`⚠️  Active journey already exists. Skipping "${journey.name}".`);
        continue;
      }

      const res = await fetch(`${API_URL}/api/journey/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
        },
        body: JSON.stringify(journey),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`✅ Created journey: "${data.name}" (ID: ${data._id}, isActive: ${data.isActive})`);
      } else {
        const err = await res.json();
        console.error(`❌ Failed to create "${journey.name}":`, err.message || err);
      }
    } catch (err) {
      console.error(`❌ Error creating "${journey.name}":`, err.message);
    }
  }

  console.log('\n🎉 Done!');
  process.exit(0);
}

seedJourneys();
