import React, { useState } from 'react';
import styles from './feedback.module.css';
import { useNavigate } from 'react-router-dom';
import { Rating } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Feedback: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [experience, setExperience] = useState<number | null>(0);
  const [difficulty, setDifficulty] = useState<number | null>(0);
  const [awareness, setAwareness] = useState<number | null>(0);
  const [minigames, setMinigames] = useState<number | null>(0);
  const [recommend, setRecommend] = useState<number | null>(0);
  const [navigation, setNavigation] = useState<number | null>(0);
  const backend_api_feedback = import.meta.env.VITE_BACKEND + '/api/feedback';

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(backend_api_feedback, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          experience,
          difficulty,
          awareness,
          minigames,
          recommend,
          navigation,
        }),
      });
    } catch (err) {
      console.error('Error saving feedback:', err);
    } finally {
      navigate('/');
    }
    }

  return (
    <div className={styles.feedback}>
      <div className={styles.feedback_title}>{t('feedback.title')}</div>
      <div className={styles.feedback_form}>
          <div className={styles.feedback_question}>
            <div>{t('feedback.q_experience')}</div>
            <Rating
              value={experience}
              onChange={(_, v) => setExperience(v)}
              sx={{
                fontSize: 48,
                color: '#ffb400',
                '& .MuiRating-iconEmpty': { color: '#555' },
              }}
            />
          </div>
          <div className={styles.feedback_question}>
            <div>{t('feedback.q_difficulty')}</div>
            <Rating
              value={difficulty}
              onChange={(_, v) => setDifficulty(v)}
              sx={{
                fontSize: 48,
                color: '#ffb400',
                '& .MuiRating-iconEmpty': { color: '#555' },
              }}
            />
          </div>
          <div className={styles.feedback_question}>
            <div>{t('feedback.q_awareness')}</div>
            <Rating
              value={awareness}
              onChange={(_, v) => setAwareness(v)}
              sx={{
                fontSize: 48,
                color: '#ffb400',
                '& .MuiRating-iconEmpty': { color: '#555' },
              }}
            />
          </div>
          <div className={styles.feedback_question}>
            <div>{t('feedback.q_minigames')}</div>
            <Rating
              value={minigames}
              onChange={(_, v) => setMinigames(v)}
              sx={{
                fontSize: 48,
                color: '#ffb400',
                '& .MuiRating-iconEmpty': { color: '#555' },
              }}
            />
          </div>
          <div className={styles.feedback_question}>
            <div>{t('feedback.q_recommend')}</div>
            <Rating
              value={recommend}
              onChange={(_, v) => setRecommend(v)}
              sx={{
                fontSize: 48,
                color: '#ffb400',
                '& .MuiRating-iconEmpty': { color: '#555' },
              }}
            />
          </div>
          <div className={styles.feedback_question}>
            <div>{t('feedback.q_navigation')}</div>
            <Rating
              value={navigation}
              onChange={(_, v) => setNavigation(v)}
              sx={{
                fontSize: 48,
                color: '#ffb400',
                '& .MuiRating-iconEmpty': { color: '#555' },
              }}
            />
          </div>
        <button onClick={handleSubmit} className={styles.feedback_button}>
          {t('feedback.submit')}
        </button>
      </div>
    </div>
  );
};

export default Feedback;