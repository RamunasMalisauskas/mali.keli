import { httpsHref, mailtoHref } from "../../lib/safe.js";
import { footer } from "../../data/footer.js";
import WaveMark from "../WaveMark/WaveMark.jsx";
import "./Footer.css";

export default function Footer() {
  const mail = mailtoHref(footer.email);
  const instagram = httpsHref(footer.instagram.url);
  const facebook = httpsHref(footer.facebook.url);

  return (
    <footer className="contact" id="contact">
      <div className="contact-copy">
        <p className="contact-name">{footer.studio}</p>
        <p className="contact-tagline">{footer.tagline}</p>
        <nav className="contact-links" aria-label="Contact">
          {mail ? (
            <a href={mail}>
              <WaveMark />
              email
            </a>
          ) : (
            <span>
              <WaveMark />
              email
            </span>
          )}
          {instagram ? (
            <a href={instagram} rel="noopener noreferrer" target="_blank">
              <WaveMark />
              instagram
            </a>
          ) : (
            <span>
              <WaveMark />
              instagram
            </span>
          )}
          {facebook ? (
            <a href={facebook} rel="noopener noreferrer" target="_blank">
              <WaveMark />
              facebook
            </a>
          ) : (
            <span>
              <WaveMark />
              facebook
            </span>
          )}
        </nav>
      </div>
      <p className="hero-mark contact-mark">
        <span className="work-dot" aria-hidden="true" />
        Contacts
      </p>
    </footer>
  );
}
