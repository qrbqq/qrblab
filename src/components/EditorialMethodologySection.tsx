import {ArchitecturalFrame} from './ArchitecturalFrame';
import {KineticHeadline} from './KineticHeadline';
import {ScrollReveal} from './ScrollReveal';

interface EditorialMethodologySectionProps {
  id?: string;
}

const DELIVERABLES = [
  {
    eyebrow: 'PEER-VERIFIABLE CITATIONS',
    title: 'Technical Monographs & Formal Papers',
    body: 'Open, long-form PDF documentation detailing mathematical state representations, kinematic derivations, and experimental methodology. Formatted with rigorous citation standards and downloadable directly without registration or paywalls.',
  },
  {
    eyebrow: 'PHYSICAL-IN-THE-LOOP LOGS',
    title: 'Testbench Telemetry & Bench Observations',
    body: 'First-hand empirical captures from active hardware testing. Documents transient response, thermal dissipation limits, bus latency, and behavioral deviations observed across physical microcontrollers, sensors, and actuators under load.',
  },
  {
    eyebrow: 'COMPUTATIONAL AUTOMATION',
    title: 'Deterministic Workflows & Agent Tooling',
    body: 'Minimalist computational routines, verification scripts, and agent skill files designed to execute targeted engineering tasks with zero bloat and fully transparent local execution logic.',
  },
] as const;

const ENGINEERING_VECTORS = [
  {
    code: 'VECTOR 01',
    title: 'Mechatronics & High-Bandwidth Actuation',
    body: 'Electro-mechanical dynamics, compact motor windings, field-oriented control implementations, and physical power stage optimization.',
  },
  {
    code: 'VECTOR 02',
    title: 'Artificial Intelligence & Physical Perception',
    body: 'Self-attention mechanisms adapted for temporal sensor streams, real-time feature extraction, and edge inference constraints.',
  },
  {
    code: 'VECTOR 03',
    title: 'Robotics & Multi-Axis Kinematics',
    body: 'Forward and inverse kinematic transformations, low-latency control loops, and joint coordination on resource-limited embedded hardware.',
  },
  {
    code: 'VECTOR 04',
    title: 'Autonomous Systems & State Estimation',
    body: 'Multi-sensor consensus, visual-inertial odometry, decentralized path generation, and real-time navigation in GPS-denied configurations.',
  },
] as const;

export function EditorialMethodologySection({
  id = 'methodology',
}: EditorialMethodologySectionProps) {
  return (
    <ArchitecturalFrame
      id={id}
      ariaLabel="Editorial & Technical Methodology"
      livingBorder
      spacing="editorial"
    >
      <div>
        {/* PART A: Core Deliverables (What qrblab Produces) */}
        <section aria-labelledby="methodology-deliverables-heading">
          <ScrollReveal staggerIndex={0} className="flex items-center gap-3">
            <p className="font-eyebrow-mono min-w-0 text-[10px] font-medium leading-relaxed text-[#707070] sm:shrink-0 sm:text-[11px]">
              01 / SYSTEM DELIVERABLES
            </p>
            <span
              aria-hidden="true"
              className="hidden h-px flex-1 bg-white/[0.08] sm:block"
            />
          </ScrollReveal>

          <KineticHeadline
            as="h2"
            id="methodology-deliverables-heading"
            text="Verifiable Engineering & Empirical Artifacts"
            className="mt-4 max-w-3xl text-3xl text-[#F5F5F5] sm:text-4xl lg:text-[3rem]"
          />

          <ScrollReveal staggerIndex={2}>
            <p className="font-display-card mt-4 max-w-2xl text-lg font-medium text-[#A0A0A0] sm:text-xl">
              Independent monographs, testbench telemetry, and deterministic
              tooling developed under physical operating constraints.
            </p>
          </ScrollReveal>

          <div className="mt-10 grid grid-cols-1 border-t border-white/[0.08] divide-y divide-white/[0.08] lg:mt-12 lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:divide-white/[0.08]">
            {DELIVERABLES.map((item, index) => (
              <ScrollReveal
                key={item.eyebrow}
                staggerIndex={index % 3}
                className="flex flex-col py-8 lg:px-8 lg:py-10 first:lg:ps-0 last:lg:pe-0"
              >
                <p className="font-eyebrow-mono text-[10px] font-medium text-[#707070] sm:text-[11px]">
                  {item.eyebrow}
                </p>
                <h3 className="font-display-card mt-3 text-lg font-semibold text-[#F5F5F5] sm:text-xl">
                  {item.title}
                </h3>
                <p className="font-editorial-body mt-3.5 text-sm text-[#A0A0A0] sm:text-[15px]">
                  {item.body}
                </p>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* PART B: Experimental Scope, Physical Bounds & Realistic Research Boundaries */}
        <section
          aria-labelledby="methodology-constraints-heading"
          className="mt-20 border-t border-white/[0.08] pt-20 md:mt-28 md:pt-24"
        >
          <ScrollReveal staggerIndex={0} className="flex items-center gap-3">
            <p className="font-eyebrow-mono min-w-0 text-[10px] font-medium leading-relaxed text-[#707070] sm:shrink-0 sm:text-[11px]">
              02 / METHODOLOGY & OPERATIONAL CONSTRAINTS
            </p>
            <span
              aria-hidden="true"
              className="hidden h-px flex-1 bg-white/[0.08] sm:block"
            />
          </ScrollReveal>

          <KineticHeadline
            as="h2"
            id="methodology-constraints-heading"
            text="Empirical Modeling Across Variable Physical Regimes"
            className="mt-4 max-w-3xl text-3xl text-[#F5F5F5] sm:text-4xl lg:text-[3rem]"
          />

          <div className="mt-10 grid grid-cols-1 border-t border-white/[0.08] lg:mt-12 lg:grid-cols-12">
            {/* Left Column: Analytical Scope */}
            <ScrollReveal
              staggerIndex={1}
              className="py-8 lg:col-span-5 lg:py-10 lg:pe-12"
            >
              <h3 className="font-display-card text-lg font-semibold text-[#F5F5F5] sm:text-xl">
                Rigorous Inquiry Under Lab-Bound Operating Environments
              </h3>
              <p className="font-editorial-body mt-4 max-w-prose text-sm text-[#A0A0A0] sm:text-[15px]">
                All models, control algorithms, and structural observations
                published by qrblab are formulated, evaluated, and documented
                within constrained experimental testbenches. We examine system
                dynamics under forced oscillations, variable voltage supplies,
                dynamic friction, and communication jitter.
              </p>
            </ScrollReveal>

            {/* Right Column: Realistic Academic Boundary & Protective Disclaimer */}
            <ScrollReveal
              staggerIndex={2}
              className="border-t border-white/[0.08] py-8 lg:col-span-7 lg:border-t-0 lg:border-s lg:border-white/[0.08] lg:py-10 lg:ps-12"
            >
              <h3 className="font-display-card text-lg font-semibold text-[#F5F5F5] sm:text-xl">
                Analytical Context & Independent Exploration Notice
              </h3>
              <div className="font-editorial-body mt-4 max-w-prose space-y-4 text-sm text-[#A0A0A0] sm:text-[15px]">
                <p>
                  All documentation, code snippets, and research notes presented
                  across qrblab represent independent experimental inquiry and
                  academic exploratory research. They are provided solely for
                  scholarly review, conceptual exploration, and peer analysis.
                </p>
                <p>
                  Because physical behaviors vary across hardware revisions,
                  thermal envelopes, and ambient conditions, these artifacts are
                  not intended as commercial turnkey specifications or
                  safety-critical production blueprints. Readers and engineers
                  are advised to verify mathematical formulations and conduct
                  independent validation before applying principles to physical
                  systems.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* PART C: The Four Engineering Vectors (Technical Breadth) */}
        <section
          aria-labelledby="methodology-taxonomy-heading"
          className="mt-20 border-t border-white/[0.08] pt-20 md:mt-28 md:pt-24"
        >
          <ScrollReveal staggerIndex={0} className="flex items-center gap-3">
            <p className="font-eyebrow-mono min-w-0 text-[10px] font-medium leading-relaxed text-[#707070] sm:shrink-0 sm:text-[11px]">
              03 / SYSTEMS TAXONOMY
            </p>
            <span
              aria-hidden="true"
              className="hidden h-px flex-1 bg-white/[0.08] sm:block"
            />
          </ScrollReveal>

          <KineticHeadline
            as="h2"
            id="methodology-taxonomy-heading"
            text="Integrated Mechanical, Perceptual & Autonomous Vectors"
            className="mt-4 max-w-3xl text-3xl text-[#F5F5F5] sm:text-4xl lg:text-[3rem]"
          />

          <div className="mt-10 grid grid-cols-1 border-t border-white/[0.08] sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
            {ENGINEERING_VECTORS.map((vector, index) => {
              const mobileTopBorder =
                index > 0 ? 'border-t border-white/[0.08]' : '';
              const tabletGridBorders =
                index >= 2
                  ? 'sm:border-t sm:border-white/[0.08]'
                  : 'sm:border-t-0';
              const tabletColumnDivider =
                index % 2 === 1 ? 'sm:border-s sm:border-white/[0.08]' : '';
              const desktopBorders =
                index > 0
                  ? 'lg:border-t-0 lg:border-s lg:border-white/[0.08]'
                  : 'lg:border-t-0 lg:border-s-0';

              const tabletPadding =
                index % 2 === 0 ? 'sm:pe-7' : 'sm:ps-7';
              const desktopPadding =
                index === 0
                  ? 'lg:ps-0 lg:pe-7'
                  : index === ENGINEERING_VECTORS.length - 1
                    ? 'lg:ps-7 lg:pe-0'
                    : 'lg:px-7';

              return (
                <ScrollReveal
                  key={vector.code}
                  staggerIndex={index % 4}
                  className={`flex flex-col py-8 lg:py-10 ${mobileTopBorder} ${tabletGridBorders} ${tabletColumnDivider} ${desktopBorders} ${tabletPadding} ${desktopPadding}`}
                >
                  <p className="font-eyebrow-mono text-[11px] font-medium text-[#707070]">
                    {vector.code}
                  </p>
                  <h3 className="font-display-card mt-3 text-base font-semibold text-[#F5F5F5] sm:text-lg">
                    {vector.title}
                  </h3>
                  <p className="font-editorial-body mt-3 text-sm text-[#A0A0A0]">
                    {vector.body}
                  </p>
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      </div>
    </ArchitecturalFrame>
  );
}
