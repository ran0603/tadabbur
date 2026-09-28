import { useState } from 'react';
import { db } from '../../core/db';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<number>(0);

  // Step 1 states
  const [readingGoal, setReadingGoal] = useState<'big_picture' | 'depth'>('big_picture');
  const [defaultDepth, setDefaultDepth] = useState<'meanings' | 'all'>('meanings');

  // Step 2 states
  const [downloadText, setDownloadText] = useState(true);
  const [downloadCommentaries, setDownloadCommentaries] = useState(true);
  const [downloadAudio, setDownloadAudio] = useState(false);
  const downloadProgress = 62;

  // Step 3 states
  const [dailyReminders, setDailyReminders] = useState(true);
  const [reminderTime, setReminderTime] = useState('7:30 pm');
  const [actionReminders, setActionReminders] = useState(false);

  const stepTitles = ['Welcome', 'Your goal', 'Offline pack', 'Reminders'];

  const finishOnboarding = async () => {
    try {
      await db.saveSetting('onboarding_completed', true);
      await db.saveSetting('reading_goal', readingGoal);
      await db.saveSetting('default_depth', defaultDepth);
      await db.saveSetting('reminders_enabled', dailyReminders);
      await db.saveSetting('reminder_time', reminderTime);
      await db.saveSetting('action_reminders', actionReminders);
      await db.saveSetting('pack_selection', {
        text: downloadText,
        commentaries: downloadCommentaries,
        audio: downloadAudio,
      });
    } catch (e) {
      console.error('Failed to save onboarding settings', e);
    }
    onComplete();
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const renderDots = (currentStep: number) => (
    <div className="dots mb-4">
      {[0, 1, 2, 3].map((i) => (
        <i key={i} className={i <= currentStep ? 'a' : ''} />
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="flex flex-col h-full space-y-4">
            <div className="mark ar">ت</div>
            <div>
              <h1 className="text-3xl font-serif leading-tight font-bold text-[var(--ink)]">
                Read the Qur'an.<br />
                Understand it.<br />
                Live it.
              </h1>
              <p className="mut text-sm mt-3">
                Start each Surah with the big picture, read it in meaningful passages, then carry one verse into your day.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="chip">Orient</span>
              <span className="chip">Reflect</span>
              <span className="chip">Act</span>
            </div>
            <div className="flex-1" />
            <button className="btn p" onClick={handleNextStep}>
              Get started
            </button>
            <button className="btn g text-center" onClick={finishOnboarding}>
              I already have an account
            </button>
          </div>
        );

      case 1:
        return (
          <div className="flex flex-col h-full space-y-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[var(--ink)]">How do you want to read?</h2>
              <p className="mut text-sm mt-1">You can change this anytime in Reading Settings.</p>
            </div>

            <div className="space-y-3">
              <div
                className={`opt ${readingGoal === 'big_picture' ? 'sel' : ''}`}
                onClick={() => setReadingGoal('big_picture')}
              >
                <div className="rad" />
                <div>
                  <b className="text-sm font-semibold">Understand the big picture</b>
                  <div className="mut sm">Short summaries, plain language, one clear idea per passage.</div>
                </div>
              </div>

              <div
                className={`opt ${readingGoal === 'depth' ? 'sel' : ''}`}
                onClick={() => setReadingGoal('depth')}
              >
                <div className="rad" />
                <div>
                  <b className="text-sm font-semibold">Study in depth</b>
                  <div className="mut sm">Word roots, reasons of revelation and classical commentary.</div>
                </div>
              </div>
            </div>

            <div>
              <div className="sm mut mb-1.5">Default depth</div>
              <div className="seg">
                <span
                  className={defaultDepth === 'meanings' ? 'on' : ''}
                  onClick={() => setDefaultDepth('meanings')}
                >
                  Word meanings only
                </span>
                <span
                  className={defaultDepth === 'all' ? 'on' : ''}
                  onClick={() => setDefaultDepth('all')}
                >
                  All 3 layers
                </span>
              </div>
            </div>

            <div className="flex-1" />
            <button className="btn p" onClick={handleNextStep}>
              Continue
            </button>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col h-full space-y-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[var(--ink)]">Read anywhere, offline</h2>
              <p className="mut text-sm mt-1">
                Download once. Text, passage structure and core commentary work without a connection.
              </p>
            </div>

            <div className="card space-y-3">
              <div className="li pt-0 cursor-pointer" onClick={() => setDownloadText(!downloadText)}>
                <div className={`ck ${downloadText ? 'd' : ''}`}>✓</div>
                <div className="flex-1">
                  <b className="text-sm font-semibold">Qur'an text & passages</b>
                  <div className="mut sm">Uthmani script, 114 Surahs</div>
                </div>
                <span className="sm mut">18 MB</span>
              </div>

              <div className="li cursor-pointer" onClick={() => setDownloadCommentaries(!downloadCommentaries)}>
                <div className={`ck ${downloadCommentaries ? 'd' : ''}`}>✓</div>
                <div className="flex-1">
                  <b className="text-sm font-semibold">Core commentaries</b>
                  <div className="mut sm">Ibn Kathir, Al-Qurtubi and more</div>
                </div>
                <span className="sm mut">84 MB</span>
              </div>

              <div className="li border-0 pb-0 cursor-pointer" onClick={() => setDownloadAudio(!downloadAudio)}>
                <div className={`ck ${downloadAudio ? 'd' : ''}`}>{downloadAudio ? '✓' : ''}</div>
                <div className="flex-1">
                  <b className="text-sm font-semibold">Audio: Mishary Alafasy</b>
                  <div className="mut sm">Optional</div>
                </div>
                <span className="sm mut">1.2 GB</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center sm mb-1">
                <span>Downloading… {downloadProgress}%</span>
                <span className="mut">63 of 102 MB</span>
              </div>
              <div className="bar">
                <b style={{ width: `${downloadProgress}%` }} />
              </div>
            </div>

            <div className="flex-1" />
            <button className="btn p" onClick={handleNextStep}>
              Download on Wi-Fi
            </button>
            <button className="btn g text-center" onClick={handleNextStep}>
              Do this later
            </button>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col h-full space-y-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[var(--ink)]">Gentle reminders</h2>
              <p className="mut text-sm mt-1">
                One quiet nudge to reflect. Never streak-shaming, and easy to turn off.
              </p>
            </div>

            <div className="card space-y-3">
              <div className="li pt-0">
                <div className="flex-1">
                  <b className="text-sm font-semibold">Daily reflection reminder</b>
                  <div className="mut sm">Continue your current passage</div>
                </div>
                <div
                  className={`tog ${!dailyReminders ? 'off' : ''}`}
                  onClick={() => setDailyReminders(!dailyReminders)}
                />
              </div>

              <div className="li">
                <div className="flex-1">
                  <b className="text-sm font-semibold">Time</b>
                </div>
                <span className="chip cursor-pointer" onClick={() => {
                  const newTime = reminderTime === '7:30 pm' ? '8:00 am' : '7:30 pm';
                  setReminderTime(newTime);
                }}>
                  {reminderTime}
                </span>
              </div>

              <div className="li border-0 pb-0">
                <div className="flex-1">
                  <b className="text-sm font-semibold">Action reminders</b>
                  <div className="mut sm">Only for tasks you create</div>
                </div>
                <div
                  className={`tog ${!actionReminders ? 'off' : ''}`}
                  onClick={() => setActionReminders(!actionReminders)}
                />
              </div>
            </div>

            <div className="flex-1" />
            <button className="btn p" onClick={finishOnboarding}>
              Turn on reminders
            </button>
            <button className="btn g text-center" onClick={finishOnboarding}>
              Not now
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      {/* Desktop / Tablet Split Layout (hidden on small screens) */}
      <div className="hidden md:grid grid-cols-12 w-full max-w-5xl bg-[var(--surf)] rounded-2xl border border-[var(--line)] overflow-hidden shadow-xl min-h-[640px]">
        {/* Left Branded Pattern Sidebar */}
        <div className="col-span-5 pat p-10 flex flex-col justify-between">
          <div>
            <div className="mark ar bg-white/10 mb-4">ت</div>
            <h2 className="text-3xl font-serif font-bold text-white mb-6">Tadabbur</h2>
            <div className="space-y-4">
              {stepTitles.map((title, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 transition-opacity ${
                    i === step ? 'opacity-100 font-semibold' : 'opacity-55'
                  }`}
                >
                  <u
                    className={`w-6 h-6 rounded-full border border-current flex items-center justify-center no-underline text-xs ${
                      i === step ? 'bg-[var(--gold)] border-[var(--gold)] text-[var(--ink)] font-bold' : ''
                    }`}
                  >
                    {i + 1}
                  </u>
                  <span className="text-sm">{title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1 pt-8 border-t border-white/10">
            <div className="ar text-2xl text-[var(--gold)]">أَفَلَا يَتَدَبَّرُونَ ٱلْقُرْءَانَ</div>
            <div className="sm opacity-70">Do they not reflect on the Qur'an? (4:82)</div>
          </div>
        </div>

        {/* Right Content View */}
        <div className="col-span-7 p-10 bg-[var(--bg)] flex flex-col justify-center items-center">
          <div className="w-full max-w-md min-h-[500px] flex flex-col justify-between bg-[var(--surf)] p-8 rounded-2xl border border-[var(--line)] shadow-sm">
            {renderDots(step)}
            {renderStepContent()}
          </div>
        </div>
      </div>

      {/* Mobile Frame Layout (visible on small screens) */}
      <div className="block md:hidden w-full max-w-sm bg-[var(--surf)] rounded-2xl border border-[var(--line)] shadow-lg p-6 min-h-[750px] flex flex-col">
        {renderDots(step)}
        {renderStepContent()}
      </div>
    </div>
  );
}
