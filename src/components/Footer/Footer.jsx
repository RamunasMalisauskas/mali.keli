import "./Footer.css";
import { footer } from "../../data/footer.js";

export default function Footer() {
  const { studio, email, instagram, inquiries } = footer;

  return (
    <footer className="contact" id="contact">
      <h2>Contact</h2>
      <dl className="details">
        <div>
          <dt>Studio</dt>
          <dd>{studio}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${email}`}>{email}</a>
          </dd>
        </div>
        <div>
          <dt>Instagram</dt>
          <dd>
            <a href={instagram.url} rel="noreferrer">
              {instagram.handle}
            </a>
          </dd>
        </div>
        <div>
          <dt>Inquiries</dt>
          <dd>{inquiries}</dd>
        </div>
      </dl>
    </footer>
  );
}
