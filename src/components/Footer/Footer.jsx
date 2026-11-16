import { httpsHref, mailtoHref } from "../../lib/safe.js";
import { footer } from "../../data/footer.js";
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
            <a href={mail}>〰️ email</a>
          ) : (
            <span>〰️ email</span>
          )}
          {instagram ? (
            <a href={instagram} rel="noopener noreferrer" target="_blank">
              〰️ instagram
            </a>
          ) : (
            <span>〰️ instagram</span>
          )}
          {facebook ? (
            <a href={facebook} rel="noopener noreferrer" target="_blank">
              〰️ facebook
            </a>
          ) : (
            <span>〰️ facebook</span>
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
