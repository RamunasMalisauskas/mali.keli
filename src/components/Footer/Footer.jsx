import { httpsHref, mailtoHref } from "../../lib/safe.js";
import { footer } from "../../data/footer.js";
import "./Footer.css";

export default function Footer() {
  const mail = mailtoHref(footer.email);
  const instagram = httpsHref(footer.instagram.url);

  return (
    <footer className="contact" id="contact">
      <h2>Contact</h2>
      <dl className="details">
        <div>
          <dt>Studio</dt>
          <dd>{footer.studio}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{mail ? <a href={mail}>{footer.email}</a> : footer.email}</dd>
        </div>
        <div>
          <dt>Instagram</dt>
          <dd>
            {instagram ? (
              <a href={instagram} rel="noopener noreferrer" target="_blank">
                {footer.instagram.handle}
              </a>
            ) : (
              footer.instagram.handle
            )}
          </dd>
        </div>
        <div>
          <dt>Inquiries</dt>
          <dd>{footer.inquiries}</dd>
        </div>
      </dl>
      <span className="contact-dot work-dot" aria-hidden="true" />
    </footer>
  );
}
