import React from 'react';
import styles from './Legal.module.css';
import { useNavigate } from 'react-router-dom';

const Legal: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.legal}>
      <div className={styles.legal_inside}>
        <button
          onClick={() => navigate('/settings')}
          className={styles.legal_btn}
        >
          Go back
        </button>
        <div className={styles.legal_title}>Legal Information</div>
        <div className={styles.legal_text}>
          <b>Terms of Service</b>
          <p>
            By accessing or using this application, you agree to be bound by
            these Terms of Service. You must not use the app for any unlawful or
            prohibited purpose.
          </p>

          <b>Privacy Policy</b>
          <p>
            We collect and process personal data only as necessary to provide
            and improve the service. Your data is stored securely and never
            shared with third parties without your consent.
          </p>

          <b>Cookie Policy</b>
          <p>
            This application uses cookies to enhance performance and user
            experience. You may control or disable cookies in your browser
            settings at any time.
          </p>

          <b>Intellectual Property Rights</b>
          <p>
            All content, graphics, and code in this application are the property
            of Spatium Human Trafficking Research Center and its licensors.
            Unauthorized use, reproduction, or distribution is prohibited.
          </p>

          <b>Limitation of Liability</b>
          <p>
            To the fullest extent permitted by law, we shall not be liable for
            any indirect, incidental, special, or consequential damages arising
            from your use of the application.
          </p>

          <b>Governing Law</b>
          <p>
            These terms are governed by and construed in accordance with the
            laws of Moldova. Any disputes relating to these terms shall be
            subject to the exclusive jurisdiction of the courts of Chișinău.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Legal;
