import "./SummonModal.css";

export default function SummonModal({ show, onClose }) {
  switch (show) {
    case 0:
      return null;

    case 1:
      return (
        <div>
          <div id="summon-top" className="summon-message">
            <div id="summon-pic"></div>
            Edgar S. Rodrigues<br />Web developer<br />2002, Brazil<br />Portuguese, English
          </div>
          <div id="summon-bottom" className="summon-message">
            Contact me?
            <div id="summon-button-list">
              <button className="summon-button" onClick={() => window.open("https://github.com/EdgrSR", "_blank")}>OK</button>
              <button className="summon-button" onClick={onClose}>CANCEL</button>
            </div>
          </div>
        </div>
      );

    case 2:
      return (
        <div>
          <div id="message" className="summon-message">
            <div id="message-content">
              <div id="message-icon"></div>
              <div id="message-text">
                <p>Hi, I'm Edgar!</p>
                <p>A web developer seeking to improve my skills and learn new technologies!</p>
              </div>
            </div>
            <div id="message-button-list">
              <button className="message-button" onClick={onClose}>Close</button>
              <button className="message-button" onClick={onClose}>Good</button>
              <button className="message-button" onClick={onClose}>Poor</button>
            </div>
          </div>
        </div>
      );

    case 3:
      return (
        <div>
          <div id="message" className="summon-message">
            <div id="message-content">
              <div id="message-icon"></div>
              <div id="message-text">
                <p>Technologies I have used in projects:</p>
                <p>JavaScript, TypeScript, C++, Python.<br />React, Node, Express, Flask.</p>
              </div>
            </div>
            <div id="message-button-list">
              <button className="message-button" onClick={onClose}>Close</button>
              <button className="message-button" onClick={onClose}>Good</button>
              <button className="message-button" onClick={onClose}>Poor</button>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
