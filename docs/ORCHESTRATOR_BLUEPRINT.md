# Echo Pro — Secure Operations Orchestrator

## الهدف

إضافة طبقة تشغيل مؤسسية فوق التطبيق الحالي دون تغيير وظائف المحادثة أو الواجهة أو قاعدة البيانات الحالية. الطبقة الجديدة تفصل بين **التخطيط** و**الموافقة** و**التنفيذ** و**التحقق** و**الرجوع**.

## قاعدة عدم تغيير السلوك

- لا تعديل على `workspace.messages.send`.
- لا تعديل على استخراج رد المساعد الحالي.
- لا تغيير في مخطط PostgreSQL الحالي.
- لا تغيير في Redis أو مفاتيح البيئة الحالية.
- لا تخزين أسرار داخل Git.
- أي تنفيذ تغييري يجب أن يمر عبر موافقة صريحة.
- كل عملية تحمل `request_id` و`commit_sha` و`actor` ونتيجة التحقق.

## البنية المستهدفة

```text
User / Admin UI
      |
      v
Request Intake
      |
      v
Planner / Policy Gate
      |
      +----> Read-only inspection
      |
      v
Approval Gate  <---- Slack / Teams / UI
      |
      v
Execution Runner
      |
      +---- GitHub
      +---- Railway
      +---- Vercel
      +---- External services
      |
      v
Health + Smoke Tests
      |
      +---- SUCCESS ----> Audit Manifest + Metrics
      |
      +---- FAIL ------> Rollback / Freeze + Alert
```

## مكونات MVP

### 1. Request Intake
يستقبل الطلب ويولّد معرفًا فريدًا للعملية. لا ينفّذ أوامر مباشرة.

### 2. Planner
يحوّل الطلب إلى خطة قابلة للمراجعة:

- الملفات التي ستتأثر.
- العمليات المطلوبة.
- المخاطر.
- الاختبارات المطلوبة.
- خطة الرجوع.

### 3. Policy Gate
يرفض تلقائيًا العمليات الخطرة مثل كشف الأسرار أو حذف البيانات أو تغيير قاعدة البيانات دون تصريح صريح.

### 4. Human Approval
لا يسمح بالتنفيذ الإنتاجي قبل الموافقة. GitHub Environments أو موفر موافقة خارجي يمكن استخدامه حسب بيئة النشر.

### 5. Runner
ينفذ أقل عدد ممكن من العمليات وبأقل صلاحيات. يفضّل GitHub-hosted runner للعمليات غير الحساسة وself-hosted runner فقط عندما تكون الشبكة الخاصة ضرورية.

### 6. Verification
بعد كل نشر:

1. تحقق من حالة deployment.
2. تحقق من health endpoint.
3. نفّذ smoke test للمحادثة.
4. تحقق من أن الرد غير فارغ.
5. تحقق من عدم ارتفاع معدل الأخطاء.

### 7. Rollback
إذا فشل التحقق، يمنع أي نشر لاحق ويستعيد آخر نسخة سليمة مع تسجيل السبب.

### 8. Audit
كل عملية تسجل JSON يحتوي على:

```json
{
  "request_id": "...",
  "commit_sha": "...",
  "actor": "...",
  "environment": "production",
  "action": "deploy",
  "approval": "approved",
  "started_at": "...",
  "finished_at": "...",
  "verification": "success",
  "rollback": false
}
```

## إدارة الأسرار

الأسرار المطلوبة مستقبلًا، إن لزم استخدامها، تبقى خارج المستودع:

- `KIMI_API_KEY`
- `JWT_SECRET`
- مفاتيح GitHub/Railway/Vercel الخاصة بالتشغيل الآلي.
- مفاتيح Slack/Teams عند إضافة الموافقة الخارجية.

لا يتم نسخ أي قيمة سرية إلى ملفات المشروع أو سجلات CI.

## مراحل التنفيذ

### المرحلة A — الأساس الآمن

- تعريف `request_id`.
- سجل تدقيق موحد.
- سياسة صلاحيات.
- بوابة موافقة.
- فحوص build/type/test الحالية.

### المرحلة B — نشر مضبوط

- ربط GitHub `main` بمسار نشر واحد.
- انتظار `SUCCESS` قبل اعتبار العملية ناجحة.
- health check + smoke test.
- rollback عند الفشل.

### المرحلة C — المراقبة

- latency.
- error rate.
- deployment failures.
- LLM failures.
- health state.
- audit events.

### المرحلة D — المعالجة التلقائية المحدودة

الأتمتة لا تصلح كل شيء تلقائيًا. عند خطأ عالي الخطورة:

1. تجميد النشر.
2. جمع الأدلة.
3. إنشاء تقرير.
4. اقتراح الإصلاح.
5. طلب موافقة.
6. تنفيذ الإصلاح.
7. التحقق.

### المرحلة E — الذاكرة/RAG

تخزين سياسات المشروع وقرارات التشغيل ومعلومات البنية في مخزن منفصل ومشفّر، مع عزل بيانات المستخدم عن بيانات التشغيل.

## المراقبة المقترحة

### Metrics

- `assistant_request_total`
- `assistant_response_success_total`
- `assistant_response_empty_total`
- `assistant_response_latency_ms`
- `deployment_success_total`
- `deployment_failure_total`
- `rollback_total`

### Alerts

- ردود فارغة متتالية.
- health check فاشل.
- deployment FAILED.
- ارتفاع مفاجئ في latency.
- تغير غير متوقع في configuration.

## استراتيجية النشر

المرجع الحالي هو GitHub `main`. لا يعتبر Railway متزامنًا حتى يصبح deployment ناجحًا ويجتاز التحقق الوظيفي. نسخة Manus تستخدم كمرجع سلوكي فقط إلى أن يتوفر مصدرها/تصديرها للمقارنة الآلية.

## قاعدة التغيير

كل تغيير يجب أن يكون:

1. صغيرًا.
2. قابلًا للعكس.
3. قابلًا للاختبار.
4. موثقًا.
5. غير مؤثر على وظائف التطبيق إلا إذا كان الإصلاح نفسه مطلوبًا.

## النتيجة المستهدفة

`طلب → تحليل → خطة → موافقة → تنفيذ → نشر → تحقق → تدقيق → تعلم/تحسين`

بدل:

`طلب → تعديل مباشر → نشر غير مراقب`
