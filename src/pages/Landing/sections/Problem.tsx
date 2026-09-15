import { Users } from "lucide-react";
import { Eyebrow, SectionLabel, Shell } from "../components/ui";
import { ChatBubble } from "../components/ProductMocks";

export default function Problem() {
  return (
    <section className="border-t border-line bg-paper py-20 md:py-28">
      <Shell>
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-line bg-paper-deep p-4 md:p-5">
              <div className="flex items-center gap-2.5 border-b border-line pb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-wa-wash">
                  <Users strokeWidth={1.5} className="h-4 w-4 text-wa-deep" />
                </span>
                <div>
                  <p className="text-sm font-semibold tracking-tight text-ink">
                    BSCS-7B · Official
                  </p>
                  <p className="font-mono text-eyebrow uppercase text-faint">
                    412 members
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-4">
                <ChatBubble author="Areeba" time="21:48" dim>
                  anyone has the CV slides from today
                </ChatBubble>
                <ChatBubble author="Hamza" time="22:03" dim>
                  bhai lab report ka format?
                </ChatBubble>
                <ChatBubble author="CR · Talha" time="22:14">
                  Quiz tomorrow in{" "}
                  <span className="font-medium">Information Security</span>,
                  Classroom 8.
                </ChatBubble>
                <ChatBubble author="Zoya" time="22:15" dim>
                  😭😭
                </ChatBubble>
                <ChatBubble author="Hamza" time="23:31" dim>
                  gn everyone
                </ChatBubble>
              </div>

              <p className="mt-4 border-t border-line pt-3 text-center">
                <Eyebrow>+ 186 messages after this one</Eyebrow>
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7 lg:pt-6">
            <SectionLabel index="01" label="The problem" />
            <h2 className="mt-6 text-headline font-semibold text-ink">
              Your deadlines are already
              <br className="hidden md:block" /> written down. They are just
              buried.
            </h2>
            <p className="mt-6 max-w-[48ch] text-lead text-muted">
              Quizzes, submissions and room changes arrive as one message in a
              group of four hundred people — at 11pm, between a meme and a
              question about slides. By morning it is gone.
            </p>

            <dl className="mt-10 divide-y divide-line border-y border-line">
              {[
                ["Scrolling back", "The quiz message is 186 messages up."],
                ["No single place", "Timetable in a PDF, deadlines in a chat."],
                ["No nudge", "Nothing reminds you the morning it is due."],
              ].map(([term, desc]) => (
                <div key={term} className="flex gap-6 py-4">
                  <dt className="w-32 shrink-0 font-mono text-eyebrow uppercase text-faint">
                    {term}
                  </dt>
                  <dd className="text-sm text-ink">{desc}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-8 text-lead font-medium tracking-tight text-ink">
              DueMate reads that one message once — then keeps it, and reminds
              you where you already are.
            </p>
          </div>
        </div>
      </Shell>
    </section>
  );
}
