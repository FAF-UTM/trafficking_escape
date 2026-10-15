import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useEmbeddedSettings,
  usePageExitOnIntro,
} from '../../components/shell/minigameChromeContext';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MinigameSettingsMenu from '../../components/shell/MinigameSettingsMenu';
import { useAudio } from '../../context/AudioContext';
import CodePad from './CodePad';
import styles from './ClickPlayGame.module.css';
import {
  HINT_COST,
  HINTS,
  ITEM_META,
  LEVEL_BG,
  LEVEL_CLEAR_BONUS,
  LEVEL_ORDER,
  START_SCORE,
  timeBonusForSeconds,
  WRONG_CODE_COST,
} from './constants';
import type { ItemId, LevelId } from './types';

type Phase = 'intro' | 'play' | 'end';

interface CodeSession {
  titleKey: string;
  answer: string;
  length: number;
  onSuccess: () => void;
}

interface ClickPlayGameProps {
  onComplete: () => void;
}

const formatClock = (totalSec: number) => {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const ClickPlayGame: React.FC<ClickPlayGameProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { playClick } = useAudio();

  const [phase, setPhase] = useState<Phase>('intro');
  usePageExitOnIntro(phase === 'intro');
  useEmbeddedSettings(phase === 'play');

  const [levelIndex, setLevelIndex] = useState(0);
  const levelId = LEVEL_ORDER[levelIndex];

  const [score, setScore] = useState(START_SCORE);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintStep, setHintStep] = useState(0);
  const [hintConfirmOpen, setHintConfirmOpen] = useState(false);

  const [inventory, setInventory] = useState<ItemId[]>([]);
  const [spent, setSpent] = useState<Set<ItemId>>(() => new Set());
  const [selected, setSelected] = useState<ItemId | null>(null);
  const [flags, setFlags] = useState<Set<string>>(() => new Set());

  const [message, setMessage] = useState<string | null>(null);
  const [pendingAdvance, setPendingAdvance] = useState(false);
  const [codeSession, setCodeSession] = useState<CodeSession | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [bgFailed, setBgFailed] = useState(false);

  const playStartedAt = useRef<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [timeBonus, setTimeBonus] = useState(0);

  const levelNumber = levelIndex + 1;

  useEffect(() => {
    if (phase !== 'play') return;
    if (playStartedAt.current == null) {
      playStartedAt.current = Date.now();
    }
    const tick = () => {
      const start = playStartedAt.current ?? Date.now();
      setElapsedSec(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  const has = (id: ItemId) => inventory.includes(id);
  const flagged = (f: string) => flags.has(f);

  const setFlag = (f: string) =>
    setFlags((prev) => {
      if (prev.has(f)) return prev;
      const next = new Set(prev);
      next.add(f);
      return next;
    });

  const say = (key: string) => {
    playClick(8);
    setMessage(t(`clickPuzzle.${key}`));
  };

  const addItem = (id: ItemId, msgKey: string) => {
    setInventory((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setSelected(id);
    say(msgKey);
  };

  const spend = (amount: number) =>
    setScore((s) => Math.max(0, s - amount));

  const clearLevelState = () => {
    setInventory([]);
    setSpent(new Set());
    setSelected(null);
    setFlags(new Set());
    setHintStep(0);
    setHintConfirmOpen(false);
    setMessage(null);
    setPendingAdvance(false);
    setCodeSession(null);
    setCodeError(null);
    setBgFailed(false);
  };

  const markSpent = (id: ItemId) => {
    setSpent((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setSelected((cur) => (cur === id ? null : cur));
  };

  const completeLevel = () => {
    if (levelIndex >= LEVEL_ORDER.length - 1) {
      const elapsed =
        playStartedAt.current != null
          ? Math.max(0, Math.floor((Date.now() - playStartedAt.current) / 1000))
          : elapsedSec;
      const bonus = timeBonusForSeconds(elapsed);
      setElapsedSec(elapsed);
      setTimeBonus(bonus);
      setScore((s) => s + LEVEL_CLEAR_BONUS + bonus);
      setPhase('end');
      return;
    }
    setScore((s) => s + LEVEL_CLEAR_BONUS);
    const finished = levelNumber;
    clearLevelState();
    setLevelIndex((i) => i + 1);
    setMessage(t('clickPuzzle.levelClear', { n: finished }));
  };

  const closeMessage = () => {
    setMessage(null);
    if (!pendingAdvance) return;
    setPendingAdvance(false);
    completeLevel();
  };

  const openHintConfirm = () => {
    const list = HINTS[levelId];
    if (hintStep >= list.length) return;
    playClick(3);
    setHintConfirmOpen(true);
  };

  const confirmHint = () => {
    const list = HINTS[levelId];
    if (hintStep >= list.length) {
      setHintConfirmOpen(false);
      return;
    }
    playClick(8);
    spend(HINT_COST);
    setHintsUsed((n) => n + 1);
    const key = list[hintStep];
    setHintStep((n) => n + 1);
    setHintConfirmOpen(false);
    setMessage(t(`clickPuzzle.${key}`));
  };

  const openCode = (titleKey: string, answer: string, onSuccess: () => void) => {
    playClick(8);
    setCodeError(null);
    setCodeSession({
      titleKey,
      answer,
      length: answer.length,
      onSuccess,
    });
  };

  const submitCode = (code: string) => {
    if (!codeSession) return;
    if (code === codeSession.answer) {
      playClick(8);
      const success = codeSession.onSuccess;
      setCodeSession(null);
      setCodeError(null);
      success();
      return;
    }
    playClick(3);
    spend(WRONG_CODE_COST);
    setCodeError(t('clickPuzzle.wrongCode'));
  };

  const onInventoryClick = (id: ItemId) => {
    playClick(3);
    if (spent.has(id)) return;

    const readable = READABLE_ITEMS[id];
    if (readable) {
      setMessage(t(`clickPuzzle.${readable}`));
      setSelected(id);
      return;
    }

    setSelected((prev) => (prev === id ? null : id));
  };

  const rankKey =
    score >= 900 ? 'rank_elite' : score >= 650 ? 'rank_sharp' : 'rank_escape';

  /* ---------- Level handlers ---------- */

  const onBedroom = (id: string) => {
    switch (id) {
      case 'bed':
        if (flagged('gotKey')) {
          say('bedEmpty');
          return;
        }
        setFlag('gotKey');
        addItem('drawerKey', 'foundDrawerKey');
        return;
      case 'desk':
        if (flagged('gotNote')) {
          say('deskEmpty');
          return;
        }
        if (selected !== 'drawerKey' || spent.has('drawerKey')) {
          say('deskLocked');
          return;
        }
        setFlag('gotNote');
        markSpent('drawerKey');
        addItem('stickyNote', 'foundStickyNote');
        return;
      case 'jacket':
        if (flagged('gotPhone')) {
          say('jacketEmpty');
          return;
        }
        setFlag('gotPhone');
        addItem('phoneCase', 'foundPhoneCase');
        return;
      case 'poster':
        say('posterClue');
        return;
      case 'clock':
        say('clockClue');
        return;
      case 'window':
        say('windowBlocked');
        return;
      case 'door':
        if (flagged('doorOpen')) return;
        openCode('padDoor', '1792', () => {
          setFlag('doorOpen');
          setPendingAdvance(true);
          say('bedroomEscape');
        });
        return;
      default:
        return;
    }
  };

  const onHallway = (id: string) => {
    switch (id) {
      case 'toolbox':
        if (flagged('gotDriver')) {
          say('toolboxEmpty');
          return;
        }
        setFlag('gotDriver');
        addItem('screwdriver', 'foundScrewdriver');
        return;
      case 'cabinet':
        if (flagged('gotCipher')) {
          say('cabinetEmpty');
          return;
        }
        openCode('padCabinet', '331', () => {
          setFlag('gotCipher');
          addItem('cipherSheet', 'foundCipher');
        });
        return;
      case 'fusebox':
        if (flagged('fuseOpen')) {
          say('fuseDone');
          return;
        }
        if (selected !== 'screwdriver') {
          say('fuseNeedDriver');
          return;
        }
        setFlag('fuseOpen');
        say('fuseOpened');
        return;
      case 'whiteboard':
        if (!has('cipherSheet')) {
          say('boardLocked');
          return;
        }
        if (selected !== 'cipherSheet') {
          say('boardNeedCipher');
          return;
        }
        setFlag('decoded');
        say('boardDecoded');
        return;
      case 'monitor':
        say(flagged('fuseOpen') ? 'monitorLive' : 'monitorDark');
        return;
      case 'door':
        if (flagged('hallDoor')) return;
        if (!flagged('decoded')) {
          say('doorNeedDecode');
          return;
        }
        openCode('padHallDoor', '6294', () => {
          setFlag('hallDoor');
          setPendingAdvance(true);
          say('hallwayEscape');
        });
        return;
      default:
        return;
    }
  };

  const onBay = (id: string) => {
    switch (id) {
      case 'pallet':
        if (flagged('gotCrowbar')) {
          say('palletEmpty');
          return;
        }
        setFlag('gotCrowbar');
        addItem('crowbar', 'foundCrowbar');
        return;
      case 'crate':
        if (flagged('gotCutters')) {
          say('crateEmpty');
          return;
        }
        if (selected !== 'crowbar' || spent.has('crowbar')) {
          say('crateNeedCrowbar');
          return;
        }
        setFlag('gotCutters');
        markSpent('crowbar');
        addItem('boltCutters', 'foundCutters');
        return;
      case 'label':
        say('shippingLabel');
        return;
      case 'radio':
        if (flagged('radioDone')) {
          say('radioDone');
          return;
        }
        openCode('padRadio', '883', () => {
          setFlag('radioDone');
          say('radioMessage');
        });
        return;
      case 'lockbox':
        if (flagged('gotRemote')) {
          say('lockboxEmpty');
          return;
        }
        if (!flagged('radioDone')) {
          say('lockboxSilent');
          return;
        }
        openCode('padLockbox', '2590', () => {
          setFlag('gotRemote');
          addItem('gateRemote', 'foundRemote');
        });
        return;
      case 'gate':
        if (flagged('escaped')) return;
        if (!flagged('chainCut')) {
          if (selected !== 'boltCutters' || spent.has('boltCutters')) {
            say('gateChained');
            return;
          }
          setFlag('chainCut');
          markSpent('boltCutters');
          say('gateChainCut');
          return;
        }
        if (selected !== 'gateRemote') {
          say('gateNeedRemote');
          return;
        }
        setFlag('escaped');
        setPendingAdvance(true);
        say('bayEscape');
        return;
      default:
        return;
    }
  };

  const handleHotspot = (id: string) => {
    if (levelId === 'bedroom') onBedroom(id);
    else if (levelId === 'hallway') onHallway(id);
    else onBay(id);
  };

  const hotspots = HOTSPOTS[levelId];
  const props = SCENE_PROPS[levelId];
  const hintsLeft = HINTS[levelId].length - hintStep;

  /* ---------- Screens ---------- */

  if (phase === 'intro') {
    return (
      <div className={`${styles.screen} ${styles.introScreen}`}>
        <div className={styles.introLayout}>
          <section className={styles.intro} aria-labelledby="escape-title">
            <p className={styles.kicker}>{t('clickPuzzle.kicker')}</p>
            <h1 id="escape-title" className={styles.title}>
              {t('clickPuzzle.introTitle')}
            </h1>
            <p className={styles.lead}>{t('clickPuzzle.introText')}</p>
            <ol className={styles.steps}>
              {[1, 2, 3, 4].map((n, i) => (
                <li key={n} style={{ '--i': i } as React.CSSProperties}>
                  <span className={styles.stepNum}>{n}</span>
                  <span>
                    <strong className={styles.stepTitle}>
                      {t(`clickPuzzle.introStep${n}Title`)}
                    </strong>
                    <p className={styles.stepText}>
                      {t(`clickPuzzle.introStep${n}Text`)}
                    </p>
                  </span>
                </li>
              ))}
            </ol>
            <p className={styles.note}>{t('clickPuzzle.introNote')}</p>
            <button
              type="button"
              className="shell-button"
              onClick={() => {
                playClick(8);
                playStartedAt.current = Date.now();
                setElapsedSec(0);
                setPhase('play');
              }}
            >
              {t('clickPuzzle.start')}
            </button>
          </section>

          <aside className={styles.preview} aria-hidden="true">
            <div className={styles.previewStack}>
              {LEVEL_ORDER.map((id, i) => (
                <div
                  key={id}
                  className={styles.previewCard}
                  style={{ '--i': i } as React.CSSProperties}
                >
                  <img src={LEVEL_BG[id]} alt="" />
                  <span className={styles.previewBadge}>
                    {t('clickPuzzle.levelOf', {
                      n: i + 1,
                      total: LEVEL_ORDER.length,
                    })}{' '}
                    · {t(`clickPuzzle.levelName_${id}`)}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (phase === 'end') {
    return (
      <div className={`${styles.screen} ${styles.introScreen}`}>
        <section className={styles.endPanel} aria-labelledby="escape-end">
          <p className={styles.kicker}>{t('clickPuzzle.endKicker')}</p>
          <h1 id="escape-end" className={styles.title}>
            {t('clickPuzzle.endTitle')}
          </h1>
          <p className={styles.scoreLine}>
            {t('clickPuzzle.finalScore', { score })}
          </p>
          <p className={styles.rank}>
            {t(`clickPuzzle.${rankKey}`)}
            <br />
            {t(`clickPuzzle.${rankKey}_text`)}
          </p>
          <p className={styles.lead}>
            {t('clickPuzzle.hintsUsed', { count: hintsUsed })}
          </p>
          <p className={styles.lead}>
            {t('clickPuzzle.timeTaken', { time: formatClock(elapsedSec) })}
            {timeBonus > 0
              ? ` · ${t('clickPuzzle.timeBonus', { bonus: timeBonus })}`
              : ''}
          </p>
          <button type="button" className="shell-button" onClick={onComplete}>
            {t('clickPuzzle.continue')}
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className={`${styles.screen} ${styles.play}`}>
      <header className={styles.hud}>
        <div className={styles.hudCase}>
          <span className={styles.hudLabel}>
            {t('clickPuzzle.levelOf', {
              n: levelNumber,
              total: LEVEL_ORDER.length,
            })}
          </span>
          <span className={styles.hudTitle}>
            {t(`clickPuzzle.levelName_${levelId}`)}
          </span>
        </div>
        <div className={styles.hudStats}>
          <div className={styles.hudStat}>
            <span className={styles.hudLabel}>{t('clickPuzzle.score')}</span>
            <span className={styles.hudScoreValue} aria-live="polite">
              {score}
            </span>
          </div>
          <div className={styles.hudStat}>
            <span className={styles.hudLabel}>{t('clickPuzzle.time')}</span>
            <span className={styles.hudTimer} aria-live="polite">
              {formatClock(elapsedSec)}
            </span>
          </div>
        </div>
        <div className={styles.hudActions}>
          <button
            type="button"
            className={styles.hintBtn}
            disabled={hintsLeft <= 0}
            onClick={openHintConfirm}
          >
            <LightbulbOutlinedIcon
              className={styles.hintIcon}
              fontSize="small"
            />
            {t('clickPuzzle.hint')}
          </button>
          <MinigameSettingsMenu
            onExit={() => navigate('/mini-games')}
            gearClassName={styles.hudGear}
          />
        </div>
      </header>

      <div className={styles.sceneWrap}>
        <div
          className={`${styles.scene} ${styles[`scene_${levelId}` as const]}`}
        >
          {!bgFailed && (
            <img
              className={styles.sceneBg}
              src={LEVEL_BG[levelId]}
              alt=""
              onError={() => setBgFailed(true)}
            />
          )}
          <div className={styles.sceneVeil} />
          {bgFailed &&
            props.map((p) => (
              <div
                key={p.id}
                className={styles.prop}
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.w}%`,
                  height: `${p.h}%`,
                }}
                aria-hidden="true"
              />
            ))}
          {hotspots.map((h) => (
            <button
              key={h.id}
              type="button"
              className={styles.hotspot}
              style={{
                left: `${h.x}%`,
                top: `${h.y}%`,
                width: `${h.w}%`,
                height: `${h.h}%`,
              }}
              data-id={h.id}
              data-done={doneFlag(levelId, h.id, flags) || undefined}
              aria-label={t(`clickPuzzle.hotspot_${levelId}_${h.id}`)}
              onClick={() => handleHotspot(h.id)}
            >
              <span className={styles.hotspotLabel}>
                {t(`clickPuzzle.hotspot_${levelId}_${h.id}`)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <footer className={styles.inventory}>
        <p className={styles.invTitle}>{t('clickPuzzle.inventory')}</p>
        <div className={styles.invSlots}>
          {inventory.length === 0 ? (
            <p className={styles.invEmpty}>{t('clickPuzzle.inventoryEmpty')}</p>
          ) : (
            inventory.map((id) => {
              const isSpent = spent.has(id);
              return (
                <button
                  key={id}
                  type="button"
                  className={styles.invItem}
                  data-selected={!isSpent && selected === id ? true : undefined}
                  data-spent={isSpent || undefined}
                  aria-pressed={!isSpent && selected === id}
                  aria-disabled={isSpent || undefined}
                  aria-label={t(`clickPuzzle.item_${id}`)}
                  title={
                    isSpent
                      ? t('clickPuzzle.itemUsed')
                      : t(`clickPuzzle.item_${id}`)
                  }
                  onClick={() => onInventoryClick(id)}
                >
                  <ItemIcon id={id} label={t(`clickPuzzle.item_${id}`)} />
                </button>
              );
            })
          )}
        </div>
        {selected && !spent.has(selected) && (
          <p className={styles.selectedHint}>
            {t('clickPuzzle.selected', {
              item: t(`clickPuzzle.item_${selected}`),
            })}
          </p>
        )}
      </footer>

      {hintConfirmOpen && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="hint-confirm-title"
        >
          <div className={styles.modal}>
            <button
              type="button"
              className={styles.modalClose}
              aria-label={t('clickPuzzle.close')}
              onClick={() => setHintConfirmOpen(false)}
            >
              <CloseRoundedIcon fontSize="small" />
            </button>
            <h2 id="hint-confirm-title" className={styles.modalTitle}>
              {t('clickPuzzle.hintConfirmTitle')}
            </h2>
            <p className={styles.modalText}>
              {t('clickPuzzle.hintConfirmText', { cost: HINT_COST })}
            </p>
            <div className={styles.padActions}>
              <button
                type="button"
                className="shell-button shell-button--quiet"
                onClick={() => setHintConfirmOpen(false)}
              >
                {t('clickPuzzle.hintConfirmNo')}
              </button>
              <button
                type="button"
                className="shell-button"
                onClick={confirmHint}
              >
                {t('clickPuzzle.hintConfirmYes')}
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          onClick={closeMessage}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              aria-label={t('clickPuzzle.close')}
              onClick={closeMessage}
            >
              <CloseRoundedIcon fontSize="small" />
            </button>
            <h2 className={styles.modalTitle}>{t('clickPuzzle.message')}</h2>
            <p className={`${styles.modalText} ${styles.modalTextSolo}`}>
              {message}
            </p>
          </div>
        </div>
      )}

      {codeSession && (
        <CodePad
          title={t(`clickPuzzle.${codeSession.titleKey}`)}
          length={codeSession.length}
          error={codeError}
          onSubmit={submitCode}
          onClose={() => {
            setCodeSession(null);
            setCodeError(null);
          }}
        />
      )}
    </div>
  );
};

const ItemIcon: React.FC<{ id: ItemId; label: string }> = ({ id, label }) => {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <span className={styles.invFallback}>{label}</span>;
  }
  return (
    <img
      src={ITEM_META[id].icon}
      alt=""
      onError={() => setFailed(true)}
    />
  );
};

function doneFlag(level: LevelId, hotspot: string, flags: Set<string>): boolean {
  const map: Record<string, string> = {
    bedroom_bed: 'gotKey',
    bedroom_desk: 'gotNote',
    bedroom_jacket: 'gotPhone',
    bedroom_door: 'doorOpen',
    hallway_toolbox: 'gotDriver',
    hallway_cabinet: 'gotCipher',
    hallway_fusebox: 'fuseOpen',
    hallway_whiteboard: 'decoded',
    hallway_door: 'hallDoor',
    bay_pallet: 'gotCrowbar',
    bay_crate: 'gotCutters',
    bay_radio: 'radioDone',
    bay_lockbox: 'gotRemote',
    bay_gate: 'escaped',
  };
  const key = map[`${level}_${hotspot}`];
  return key ? flags.has(key) : false;
}

/** Readable inventory items reopen their clue modal when clicked. */
const READABLE_ITEMS: Partial<Record<ItemId, string>> = {
  stickyNote: 'foundStickyNote',
  phoneCase: 'foundPhoneCase',
  cipherSheet: 'foundCipher',
};

/** Percent boxes aligned to the 16:9 scene art in /assets/click-play/. */
const HOTSPOTS: Record<
  LevelId,
  { id: string; x: number; y: number; w: number; h: number }[]
> = {
  bedroom: [
    { id: 'window', x: 9, y: 8, w: 18, h: 34 },
    { id: 'bed', x: 6, y: 54, w: 34, h: 32 },
    // Desk drawers — further right, narrower, taller.
    { id: 'desk', x: 61, y: 40, w: 8, h: 34 },
    // Jacket on the chair — further right and up than the desk stack.
    { id: 'jacket', x: 46, y: 38, w: 12, h: 26 },
    { id: 'poster', x: 48, y: 6, w: 18, h: 24 },
    { id: 'clock', x: 68, y: 10, w: 9, h: 16 },
    // Door — higher, taller, narrower.
    { id: 'door', x: 86, y: 8, w: 10, h: 76 },
  ],
  hallway: [
    { id: 'cabinet', x: 2, y: 26, w: 14, h: 52 },
    { id: 'fusebox', x: 18, y: 20, w: 13, h: 34 },
    { id: 'whiteboard', x: 34, y: 14, w: 26, h: 40 },
    { id: 'monitor', x: 62, y: 30, w: 14, h: 24 },
    { id: 'toolbox', x: 64, y: 68, w: 16, h: 18 },
    { id: 'door', x: 84, y: 16, w: 14, h: 72 },
  ],
  bay: [
    { id: 'crate', x: 2, y: 28, w: 22, h: 44 },
    { id: 'label', x: 8, y: 36, w: 12, h: 14 },
    { id: 'pallet', x: 6, y: 74, w: 26, h: 16 },
    { id: 'radio', x: 28, y: 46, w: 12, h: 18 },
    { id: 'lockbox', x: 40, y: 28, w: 11, h: 18 },
    { id: 'gate', x: 56, y: 10, w: 40, h: 80 },
  ],
};

const SCENE_PROPS: Record<
  LevelId,
  { id: string; x: number; y: number; w: number; h: number }[]
> = {
  bedroom: [
    { id: 'p-bed', x: 8, y: 62, w: 40, h: 22 },
    { id: 'p-desk', x: 58, y: 55, w: 26, h: 22 },
    { id: 'p-door', x: 89, y: 32, w: 8, h: 44 },
  ],
  hallway: [
    { id: 'p-cab', x: 30, y: 34, w: 14, h: 36 },
    { id: 'p-door', x: 89, y: 26, w: 8, h: 50 },
    { id: 'p-board', x: 70, y: 18, w: 18, h: 24 },
  ],
  bay: [
    { id: 'p-crate', x: 34, y: 56, w: 16, h: 22 },
    { id: 'p-gate', x: 80, y: 28, w: 14, h: 50 },
    { id: 'p-pallet', x: 8, y: 70, w: 20, h: 12 },
  ],
};

export default ClickPlayGame;
