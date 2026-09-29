import React from 'react';
import { BookOpen, Heart, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-amber-900/10 dark:border-slate-800 bg-[#FDFBF7] dark:bg-[#121212] py-8 text-center text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 space-y-4">
        <div className="flex items-center justify-center gap-2 text-slate-700 dark:text-amber-200 font-amiri font-bold text-lg">
          <BookOpen className="w-5 h-5 text-amber-700" />
          <span>أول مرة أتدبر القرآن</span>
        </div>

        <p className="max-w-md mx-auto leading-relaxed">
          تطبيق إسلامي مجاني يعتمد كتاب *"أول مرة أتدبر القرآن"* للشيخ عادل محمد خليل.
          مستهدف لخدمة كافة المسلمين في المشارق والمغارب لتدبر الورد اليومي.
        </p>

        <div className="flex items-center justify-center gap-4 text-[11px] text-amber-800 dark:text-amber-400 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            يعمل بدون إنترنت (PWA Offline)
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            وقف لله تعالى
          </span>
        </div>
      </div>
    </footer>
  );
};
