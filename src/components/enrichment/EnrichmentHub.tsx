import React, { useState } from 'react';
import { BookOpen, Flame, History, HeartHandshake, Library, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { useSettingsStore } from '../../stores/useSettingsStore';

export const EnrichmentHub: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'motto' | 'salaf' | 'rules' | 'library'>('motto');

  const salafStories = [
    {
      figure: "أبو بكر الصديق رضي الله عنه",
      title: "البكاء والرقة عند تلاوة القرآن",
      narrative: "كان رضي الله عنه رجلًا أسيفاً رقيق القلب، إذا قام في الصلاة وقرأ القرآن لم يملك عينيه من البكاء، وكان يمزج الدمع بالتدبر ولا يستطيع إظهار الصوت لكثرة انتحابه.",
      takeaway: "القرآن يورث رقة القلوب وعاطفة الإيمان الإيجابية."
    },
    {
      figure: "عمر بن الخطاب رضي الله عنه",
      title: "التوقف عند حدود القرآن والعمل به",
      narrative: "كان رضي الله عنه وقّافاً عند كتاب الله تعالى، سمع رجلاً يقابله بكلمة جافة فتلا عليه أحدهم ﴿خُذِ الْعَفْوَ وَأْمُرْ بِالْعُرْفِ وَأَعْرِضْ عَنِ الْجَاهِلِينَ﴾؛ فوالمستعين بالله ما تجاوزها عمر حين تليت عليه وكان وقافاً.",
      takeaway: "التعظيم الحقيقي لكتاب الله هو الانقياد التام عند آياته."
    },
    {
      figure: "ثابت بن قيس رضي الله عنه",
      title: "الخوف والإجلال من الوعيد",
      narrative: "لما نزلت آية ﴿يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَرْفَعُوا أَصْوَاتَكُمْ فَوْقَ صَوْتِ النَّبِيِّ﴾ جلس ثابت في بيته يبكي وقال: أنا من أهل النار لأن صوتي جهوري، حتى بشره الرسول صلى الله عليه وسلم بالجنة.",
      takeaway: "محاسبة النفس الصارمة عند قراءة التكاليف."
    },
    {
      figure: "معقل بن يسار رضي الله عنه",
      title: "تقديم حكم الله على الهوى النفسي",
      narrative: "عضل أخته عن الزواج من زوجها المطلق بعد انقضاء العدة، فلما نزلت ﴿فَلَا تَعْضُلُوهُنَّ أَنْ يَنْكِحْنَ أَزْوَاجَهُنَّ﴾ قال: سمعاً لربي وطاعة، ثم دعا زوجها وزوجه إياها.",
      takeaway: "سر القرآن هو سرعة امتثال الأمر وإن خالف هواك."
    }
  ];

  const companionshipRules = [
    {
      num: 1,
      title: "ملازمة التلاوة بانتظام بصوت مسموع وهادئ من المصحف الشريف",
      detail: "أن تصحب المصحف ورداً يومياً ثابتاً، وتقرأ بترتيل وتؤدة بصوت تسمع به نفسك دون عجلة."
    },
    {
      num: 2,
      title: "الإلحاح والدعاء بصدق فتح أبواب الفهم والتدبر",
      detail: "أن تسأل الله في كل فتح ورْد: (اللهم افتح على قلبي، واجعل القرآن ربيع قلبي ونور صدري)."
    },
    {
      num: 3,
      title: "تكرار الآية المؤثرة والوقوف عندها",
      detail: "كان النبي صلى الله عليه وسلم يقوم بآية واحدة يكررها حتى يصبح ﴿إِنْ تُعَذِّبْهُمْ فَإِنَّهُمْ عِبَادُكَ...﴾."
    },
    {
      num: 4,
      title: "مطالعة فضائل القرآن وسورِه لشحذ الهمة",
      detail: "قراءة ما ورد في الصحيحين والسنن من الأجر العظيم لقارئ القرآن لتجديد الشوق والحماس."
    }
  ];

  const studyStages = [
    {
      stage: 1,
      title: "المرحلة الأولى: التفاسير الميسرة والمعاصرة",
      books: [
        { name: "أيسر التفاسير لكلام العلي الكبير", author: "الشيخ أبو بكر الجزائري", desc: "تفسير سلس يعتني بالمعاني الإجمالية والهدايات والفوائد التربوية." },
        { name: "المختصر في تفسير القرآن الكريم", author: "جماعة من علماء التفسير", desc: "تفسير محرر وجيز يركز على مقاصد السور وهدايات الآيات." },
        { name: "تفسير السعدي (تيسير الكريم الرحمن)", author: "الشيخ عبد الرحمن السعدي", desc: "من أفضل الكتب في استنباط الفوائد العظيمة والجانب السلوكي." }
      ]
    },
    {
      stage: 2,
      title: "المرحلة الثانية: المطولات والتفاسير الأثرية والتحليلية",
      books: [
        { name: "تفسير القرآن العظيم", author: "الإمام ابن كثير", desc: "أعظم تفاسير القرآن بالقرآن وبالحديث والآثار." },
        { name: "الجامع لأحكام القرآن", author: "الإمام القرطبي", desc: "موسوعة في أحكام الفقه واللغة والتدبر." },
        { name: "التفسير القيم", author: "الإمام ابن قيم الجوزية", desc: "مستخرج من مؤلفات ابن القيم، بديع في دقائق الإيمان والرقائق." },
        { name: "التسهيل لعلوم التنزيل", author: "ابن جزي الغرناطي", desc: "محرر ومجاز في غاية الدقة والبلاغة." }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Banner: Daily Motto (لَيَرَينَّ اللهُ ما أصنع) */}
      <div className="bg-gradient-to-r from-amber-800 via-amber-900 to-slate-900 text-amber-50 p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full font-semibold border border-amber-500/30">
                الشعار اليومي للمتدبر
              </span>
              <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
            </div>

            <h2 className="font-amiri font-bold text-3xl sm:text-4xl text-amber-100">
              ﴿لَيَرَينَّ اللَّهُ مَا أَصْنَعُ﴾
            </h2>

            <p className="text-amber-200/90 text-sm leading-relaxed font-cairo">
              مقولة الصحابي الجليل أنس بن النضر رضي الله عنه يوم أحد.. اجعلها شعارك في تدبر القرآن وفي كل طاعة: أن يرى الله منك صدق العزيمة وحسن العمل وخلوص النية.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center shrink-0">
            <span className="text-xs text-amber-300 block font-medium">سر القرآن هو:</span>
            <span className="font-amiri font-bold text-xl text-white block mt-1">العمل به</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => setActiveSection('motto')}
          className={`p-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 border ${
            activeSection === 'motto'
              ? 'bg-amber-800 text-white border-amber-800 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-700/40'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>سر العمل بالقرآن</span>
        </button>

        <button
          onClick={() => setActiveSection('salaf')}
          className={`p-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 border ${
            activeSection === 'salaf'
              ? 'bg-amber-800 text-white border-amber-800 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-700/40'
          }`}
        >
          <History className="w-4 h-4 text-emerald-500" />
          <span>كيف كانوا مع القرآن</span>
        </button>

        <button
          onClick={() => setActiveSection('rules')}
          className={`p-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 border ${
            activeSection === 'rules'
              ? 'bg-amber-800 text-white border-amber-800 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-700/40'
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-indigo-500" />
          <span>نصائح الصحبة (4)</span>
        </button>

        <button
          onClick={() => setActiveSection('library')}
          className={`p-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 border ${
            activeSection === 'library'
              ? 'bg-amber-800 text-white border-amber-800 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-700/40'
          }`}
        >
          <Library className="w-4 h-4 text-amber-500" />
          <span>كتب ننصح بها</span>
        </button>
      </div>

      {/* Section 1: Secret of the Quran is Action */}
      {activeSection === 'motto' && (
        <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3 text-amber-900 dark:text-amber-300 font-bold text-xl">
            <Sparkles className="w-6 h-6 text-amber-600" />
            <h3>سر القرآن هو العمل به</h3>
          </div>

          <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
            الهدف الأصلي والغاية العظمى من إنزال القرآن الكريم هو الانقياد والامتثال والعمل به في سلوك العبد وحياته اليومية. قال الحسن البصري رحمه الله: (أنزل القرآن ليعمل به، فاتخذ الناس قراءته عملاً!).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-1">
              <span className="font-bold text-amber-900 dark:text-amber-300 text-sm block">1. حوّل الآية لسلوك</span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                إذا مررت بآية في الصدق: فالتزم بعدم الكذب طيلة يومك.
              </p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
              <span className="font-bold text-emerald-900 dark:text-emerald-300 text-sm block">2. ابدأ باليسير</span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                التزام عملي واحد محدد خير من أفكار عامة غير مجسدة.
              </p>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 space-y-1">
              <span className="font-bold text-rose-900 dark:text-rose-300 text-sm block">3. قيد التزامك بالدفتر</span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                استخدم خانة الالتزام العملي في "دفتر التأملات" لمتابعة نفسك.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Section 2: How the Salaf Lived with the Quran */}
      {activeSection === 'salaf' && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-amber-100 font-bold text-xl">
            <History className="w-6 h-6 text-emerald-600" />
            <h3>كيف كانوا مع القرآن (نماذج من حياة السلف)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {salafStories.map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-xs px-3 py-1 rounded-lg font-bold">
                    {item.figure}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">قصة إيمانية</span>
                </div>

                <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {item.title}
                </h4>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-amiri text-lg">
                  "{item.narrative}"
                </p>

                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl text-xs font-semibold text-emerald-900 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
                  💡 الدرس المستفاد: {item.takeaway}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 3: Rules of Companionship */}
      {activeSection === 'rules' && (
        <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3 text-amber-900 dark:text-amber-300 font-bold text-xl">
            <HeartHandshake className="w-6 h-6 text-indigo-600" />
            <h3>نصائح وقواعد لصحبة القرآن (القواعد الأربع)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {companionshipRules.map((rule) => (
              <div
                key={rule.num}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-800 text-white font-bold text-sm flex items-center justify-center">
                    {rule.num}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {rule.title}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pr-11">
                  {rule.detail}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 4: Recommended Study Stages */}
      {activeSection === 'library' && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-slate-900 dark:text-amber-100 font-bold text-xl">
            <Library className="w-6 h-6 text-amber-600" />
            <h3>كتب ننصح بها (المكتبة المنهجية للتفسير)</h3>
          </div>

          {studyStages.map((stg) => (
            <div
              key={stg.stage}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <h4 className="font-bold text-lg text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <ChevronRight className="w-5 h-5 text-amber-600" />
                {stg.title}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stg.books.map((b, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                        {b.name}
                      </h5>
                      <span className="text-xs text-amber-800 dark:text-amber-400 font-medium block mt-0.5">
                        المؤلف: {b.author}
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};
