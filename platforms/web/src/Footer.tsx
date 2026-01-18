import "./Footer.css";

export function Footer() {
  return (
    <footer className="app-footer">
      <p>
        Built with ❤️ by{" "}
        <a
          href="https://openpatch.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenPatch
        </a>
      </p>
      <p>
        <a
          href="https://learningmap.openpatch.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Documentation
        </a>
        {" • "}
        <a
          href="https://github.com/openpatch/learningmap"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </p>
    </footer>
  );
}
