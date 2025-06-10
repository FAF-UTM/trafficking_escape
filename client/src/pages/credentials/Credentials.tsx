import React from 'react';
import styles from './Credentials.module.css';
import { useNavigate } from 'react-router-dom';

const Credentials: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.ending}>
      <div className={styles.ending_inside}>
        <button
          onClick={() => navigate('/settings')}
          className={styles.ending_btn}
        >
          Go back
        </button>
        <div className={styles.ending_title}>Credentials</div>
        <div className={styles.ending_text}>
          <b> Project Title</b> <br />
          Trafficking Escape <br />
          <br />
          <b> Commissioned by</b> <br />
          Spatium Human Trafficking Research Center <br />
          <br />
          <b>Target Audience</b>
          <ul>
            <li>High-school and university students (aged 16–25)</li>
            <li>Law-enforcement trainees and NGO volunteers</li>
            <li>Low-literacy and multilingual (RO/EN/RU) audiences</li>
          </ul>
          <br />
          <b>Platforms</b>
          <ul>
            <li>Web browsers (desktop & mobile)</li>
            <li>Progressive-Web-App capable for offline access</li>
          </ul>
          <b> Why the Game Exists</b>
          <ul>
            <li>
              <b>Awareness & Education</b> Human trafficking remains one of the
              fastest-growing crimes worldwide. Trafficking Escape uses
              gamification to help young people and law-enforcement trainees
              recognize red flags, learn safe behaviors, and develop empathy for
              victims.
            </li>

            <li>
              <b> Research & Data</b> In partnership with Spatium, in-game
              choices and chat interactions feed anonymized data back to
              researchers, helping refine prevention strategies and interview
              techniques.
            </li>
            <li>
              <b> Engagement through Storytelling</b> Rather than dry lectures,
              players live through realistic scenarios—making choices under
              pressure, seeing consequences, and discovering the human side of
              trafficking.
            </li>
          </ul>
          <b> Gameplay Mechanics</b>
          <ul>
            <li>
              Danger Meter: Real-time risk gauge that rises or falls with chat
              choices
            </li>
            <li>
              Mini-games : Players chat and play and collect “items” (e.g., fake
              ID, phone charger) and events that unlock escape options in
              minigames
            </li>
            <li>
              Branch & Merge Paths: Certain narrative branches rejoin common
              checkpoints to streamline data analysis
            </li>
          </ul>
          <b> Data Privacy & Security</b>
          <ul>
            <li> End-to-end encryption of all WebSocket traffic</li>
            <li>GDPR-compliant data handling, with opt-in consent screens</li>
            <li>
              Automated data purging after 12 months to minimize retention risks
            </li>
          </ul>
          <b>Deployment & DevOps</b>
          <ul>
            <li>
              Containerized microservices for front end, API, and analytics
              worker
            </li>
            <li>Blue-green deployment strategy to minimize downtime</li>
            <li>
              Automated smoke tests post-deployment, with rollback on failure
            </li>
          </ul>
          <b>Impact & Evaluation Metrics</b>
          <ul>
            <li>
              Knowledge Gain: Pre- and post-game surveys measuring awareness
              improvement
            </li>
            <li>
              Behavioral Intent: Players’ stated likelihood to seek help if they
              spot red flags
            </li>
            <li>
              Engagement Rates: Scenario completion times, replay frequency
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Credentials;
