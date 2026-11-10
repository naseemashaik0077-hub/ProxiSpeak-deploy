// The entry screen. The structure follows the brief; the claims are ours.
//
// Nothing here promises a feature the product does not have: there is no pricing
// page, no login, and no customer logos to show, so the page says what is true
// instead — what it is built with, and what it actually does.

const FEATURES = [
  {
    title: "Real-time discovery",
    body: "Walk into range and you are connected. No links, no invites, no call to start — proximity is the only permission you need.",
  },
  {
    title: "Spatial audio routing",
    body: "Volume follows distance, the stereo field follows direction, and furniture between two people muffles the voice.",
  },
  {
    title: "Peer-to-peer and encrypted",
    body: "Voice travels browser to browser over DTLS-SRTP. The server relays signalling and never carries the audio itself.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Activate",
    body: "Enter the office and allow the microphone. Nothing to install — it runs in the browser.",
  },
  {
    step: "02",
    title: "Set your range",
    body: "Choose how far you can hear, from 50 to 200 pixels, with a slider that takes effect immediately.",
  },
  {
    step: "03",
    title: "Connect",
    body: "Walk up to someone. Audio fades in as you approach and out as you leave, the way a real room behaves.",
  },
];

const STACK = ["React", "Socket.IO", "WebRTC", "MongoDB", "Redis"];

export default function Landing({ onEnter }) {
  return (
    <main className="landing">
      <header className="landing-nav">
        <div className="landing-brand">
          <span className="landing-mark" aria-hidden="true" />
          <span className="landing-wordmark">ProxiSpeak</span>
          <span className="landing-live" aria-hidden="true" />
          <span className="landing-live-text">Live</span>
        </div>

        <nav className="landing-links" aria-label="Sections">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#privacy">Privacy</a>
        </nav>

        <button
          type="button"
          className="landing-cta landing-cta--small"
          onClick={onEnter}
        >
          Enter the office
        </button>
      </header>

      <section className="landing-hero">
        <p className="landing-eyebrow">Spatial voice for teams</p>

        <h1 className="landing-title">
          Speak to anyone in your proximity.
          <span className="landing-title-accent"> Instantly.</span>
        </h1>

        <p className="landing-lead">
          ProxiSpeak is an office you walk through in the browser. You hear the
          people near you and nothing else — audio fades with distance, pans with
          direction, and muffles when furniture is in the way.
        </p>

        <div className="landing-actions">
          <button type="button" className="landing-cta" onClick={onEnter}>
            Enter the office
          </button>
          <span className="landing-hint">
            No install · runs in the browser · microphone only
          </span>
        </div>

        <div className="landing-radar" aria-hidden="true">
          <span className="radar-ring" />
          <span className="radar-ring" />
          <span className="radar-ring" />
          <span className="radar-core" />
          <span className="radar-dot radar-dot--a" />
          <span className="radar-dot radar-dot--b" />
          <span className="radar-dot radar-dot--c" />
        </div>
      </section>

      <section className="landing-stack" aria-label="Built with">
        <p>Built with</p>
        <ul>
          {STACK.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="landing-features" id="features" aria-label="Features">
        {FEATURES.map((feature) => (
          <article key={feature.title}>
            <h2>{feature.title}</h2>
            <p>{feature.body}</p>
          </article>
        ))}
      </section>

      <section className="landing-steps" id="how" aria-label="How it works">
        <h2>How it works</h2>
        <ol>
          {STEPS.map((item) => (
            <li key={item.step}>
              <span className="step-number">{item.step}</span>
              <span className="step-body">
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-privacy" id="privacy" aria-label="Privacy">
        <h2>What happens to your voice</h2>
        <p>
          Audio goes directly between browsers and is encrypted in transit. The
          server keeps track of where you are so it knows who is near you — it never
          records or relays the conversation itself. Move out of range and the
          connection closes.
        </p>
      </section>

      <section className="landing-final" aria-label="Get started">
        <h2>Ready to walk into the office?</h2>
        <p>Open it in two windows, or two browsers, and walk toward each other.</p>
        <button type="button" className="landing-cta" onClick={onEnter}>
          Enter the office
        </button>
      </section>

      <footer className="landing-footer">
        ProxiSpeak — spatial voice for teams. Built as a full-stack project.
      </footer>
    </main>
  );
}
