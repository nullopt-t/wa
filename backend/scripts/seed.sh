#!/bin/bash
# Seed script for Waey platform
# Usage: ./seed.sh
# Make sure backend is running on http://localhost:4001

API="http://localhost:4001/api"

echo "🌱 Seeding Waey Database..."
echo ""

# ---------- 1. Users ----------
echo "👤 Creating Users..."

# Admin
ADMIN_RES=$(curl -s -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"أحمد","lastName":"المدير","email":"admin@waey.com","password":"admin123","role":"admin"}')
echo "  Admin: $ADMIN_RES"

# Regular user
USER1_RES=$(curl -s -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"سارة","lastName":"أحمد","email":"user@waey.com","password":"user123"}')
echo "  User1: $USER1_RES"

# Therapist user
USER2_RES=$(curl -s -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"محمد","lastName":"دكتور","email":"therapist@waey.com","password":"therapist123","role":"therapist"}')
echo "  Therapist: $USER2_RES"

# Wait a moment for IDs to propagate
sleep 1

# ---------- 2. Login to get token ----------
echo ""
echo "🔑 Getting admin token..."
TOKEN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@waey.com","password":"admin123"}' | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
echo "  Token obtained: ${TOKEN:0:20}..."

AUTH="Authorization: Bearer $TOKEN"

# ---------- 3. Categories ----------
echo ""
echo "📂 Creating Categories..."

curl -s -X POST "$API/categories" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"name":"الصحة النفسية","description":"مقالات عن الصحة النفسية","icon":"fas fa-brain","color":"#8B5CF6","order":1}' > /dev/null
echo "  ✓ الصحة النفسية"

curl -s -X POST "$API/categories" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"name":"القلق والتوتر","description":"التعامل مع القلق والتوتر","icon":"fas fa-cloud","color":"#F59E0B","order":2}' > /dev/null
echo "  ✓ القلق والتوتر"

curl -s -X POST "$API/categories" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"name":"الاكتئاب","description":"فهم والتعامل مع الاكتئاب","icon":"fas fa-cloud-rain","color":"#3B82F6","order":3}' > /dev/null
echo "  ✓ الاكتئاب"

curl -s -X POST "$API/categories" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"name":"العلاقات","description":"تحسين العلاقات مع الآخرين","icon":"fas fa-heart","color":"#EC4899","order":4}' > /dev/null
echo "  ✓ العلاقات"

curl -s -X POST "$API/categories" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"name":"التنمية الذاتية","description":"تطوير الذات والنمو الشخصي","icon":"fas fa-seedling","color":"#10B981","order":5}' > /dev/null
echo "  ✓ التنمية الذاتية"

# ---------- 4. Books ----------
echo ""
echo "📚 Creating Books..."

curl -s -X POST "$API/books" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"title":"فهم القلق","slug":"understanding-anxiety","author":"د. أحمد محمد","description":"كتاب شامل عن فهم القلق وأسبابه وعلاجه","pages":120,"isFeatured":true}' > /dev/null
echo "  ✓ فهم القلق"

curl -s -X POST "$API/books" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"title":"التأمل للمبتدئين","slug":"meditation-beginners","author":"د. سارة علي","description":"دليل عملي للتعامل مع التأمل","pages":85}' > /dev/null
echo "  ✓ التأمل للمبتدئين"

curl -s -X POST "$API/books" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"title":"قوة التفكير الإيجابي","slug":"positive-thinking","author":"د. محمد حسن","description":"كيف تحول أفكارك السلبية إلى إيجابية","pages":150,"isFeatured":true}' > /dev/null
echo "  ✓ قوة التفكير الإيجابي"

# ---------- 5. Videos ----------
echo ""
echo "🎬 Creating Videos..."

curl -s -X POST "$API/videos" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"title":"تقنيات التنفس للاسترخاء","description":"تعلم 3 تقنيات تنفس فعالة","videoUrl":"https://www.youtube.com/watch?v=inpFizGfPQw","category":"تأمل","tags":["تنفس","استرخاء"],"isFeatured":true,"duration":300}' > /dev/null
echo "  ✓ تقنيات التنفس"

curl -s -X POST "$API/videos" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"title":"كيف تتعامل مع نوبة الهلع","description":"خطوات عملية للتعامل مع نوبات الهلع","videoUrl":"https://www.youtube.com/watch?v=efdF9p8bEYE","category":"قلق","tags":["هلع","قلق"]}' > /dev/null
echo "  ✓ التعامل مع نوبة الهلع"

curl -s -X POST "$API/videos" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"title":"5 عادات لصحة نفسية أفضل","description":"عادات يومية بسيطة لتحسين صحتك النفسية","videoUrl":"https://www.youtube.com/watch?v=rkZl2gsLUp4","category":"تنمية ذاتية","tags":["عادات","صحة نفسية"],"isFeatured":true,"duration":420}' > /dev/null
echo "  ✓ 5 عادات لصحة نفسية أفضل"

# ---------- 6. Medical Contacts ----------
echo ""
echo "🏥 Creating Medical Contacts..."

curl -s -X POST "$API/medical-contacts" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"name":"مستشفى الصحة النفسية","phone":"+20 2 12345678","email":"info@mentalhealth-hospital.eg","address":"القاهرة، مصر","type":"hospital","notes":"متخصص في الصحة النفسية"}' > /dev/null
echo "  ✓ مستشفى الصحة النفسية"

curl -s -X POST "$API/medical-contacts" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"name":"عيادة الهدوء","phone":"+20 2 87654321","email":"contact@calm-clinic.eg","address":"الإسكندرية، مصر","type":"clinic","notes":"استشارات نفسية فردية وجماعية"}' > /dev/null
echo "  ✓ عيادة الهدوء"

curl -s -X POST "$API/medical-contacts" -H "Content-Type: application/json" -H "$AUTH" \
  -d '{"name":"د. خالد أحمد - طبيب نفسي","phone":"+20 100 1234567","email":"dr.khaled@example.com","address":"الجيزة، مصر","type":"doctor","notes":"استشاري الطب النفسي"}' > /dev/null
echo "  ✓ د. خالد أحمد"

echo ""
echo "✅ Seeding complete!"
echo ""
echo "📋 Summary:"
echo "  Users: admin@waey.com, user@waey.com, therapist@waey.com (password: admin123/user123/therapist123)"
echo "  Categories: 5"
echo "  Books: 3"
echo "  Videos: 3"
echo "  Medical Contacts: 3"
echo ""
echo "⚠️  Note: Articles and Stories need a valid ObjectId for authorId."
echo "   You can create them manually via admin panel after logging in."
