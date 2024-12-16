import styles from './chat.module.css';
import React, {useEffect, useRef, useState} from 'react';
import Character from '../components/character/Character.tsx';
import {useAuth} from "../context/AuthContext.tsx";

interface ChatUsers {
  imgSrc: string;
  name: string;
  message: string;
  chatID: string;
}

const backend_api='http://localhost:8080'
const backend_api_generate=backend_api+'/api/v1/message-generation/generate'
const active_chat_name = 'Alex Cara';
const active_chat_img =
  'https://scontent.fkiv7-1.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=dst-png_s200x200&_nc_cat=110&ccb=1-7&_nc_sid=136b72&_nc_ohc=mKje_Qww9A4Q7kNvgG4YRdl&_nc_ad=z-m&_nc_cid=1396&_nc_zt=24&_nc_ht=scontent.fkiv7-1.fna&_nc_gid=A0zQGhvjZMya7EY1vtrUps2&oh=00_AYBKj9P_6SKmstVBXe53zc5qsD6bP65Yu7YuGSANbC61Bw&oe=6783833A';
const chatUsers: ChatUsers[] = [
  {
    imgSrc:
        'https://scontent.fkiv7-1.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=dst-png_s200x200&_nc_cat=110&ccb=1-7&_nc_sid=136b72&_nc_ohc=mKje_Qww9A4Q7kNvgG4YRdl&_nc_ad=z-m&_nc_cid=1396&_nc_zt=24&_nc_ht=scontent.fkiv7-1.fna&_nc_gid=A0zQGhvjZMya7EY1vtrUps2&oh=00_AYBKj9P_6SKmstVBXe53zc5qsD6bP65Yu7YuGSANbC61Bw&oe=6783833A',
    name: 'Alex Cara',
    message: ' Ce mai faci?',
    chatID: '0023',
  },
  {
    imgSrc:
        'https://scontent.fkiv7-1.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=dst-png_s200x200&_nc_cat=110&ccb=1-7&_nc_sid=136b72&_nc_ohc=mKje_Qww9A4Q7kNvgG4YRdl&_nc_ad=z-m&_nc_cid=1396&_nc_zt=24&_nc_ht=scontent.fkiv7-1.fna&_nc_gid=A0zQGhvjZMya7EY1vtrUps2&oh=00_AYBKj9P_6SKmstVBXe53zc5qsD6bP65Yu7YuGSANbC61Bw&oe=6783833A',
    name: 'Cristian Brinza',
    message: 'Cristian a trimis o ataşare.',
    chatID: '0232',
  },
  {
    imgSrc:
        'https://scontent.fkiv7-1.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=dst-png_s200x200&_nc_cat=110&ccb=1-7&_nc_sid=136b72&_nc_ohc=mKje_Qww9A4Q7kNvgG4YRdl&_nc_ad=z-m&_nc_cid=1396&_nc_zt=24&_nc_ht=scontent.fkiv7-1.fna&_nc_gid=A0zQGhvjZMya7EY1vtrUps2&oh=00_AYBKj9P_6SKmstVBXe53zc5qsD6bP65Yu7YuGSANbC61Bw&oe=6783833A',
    name: 'Bogdan Zlatovcen',
    message: 'Trimite poze',
    chatID: '1098',
  },
  {
    imgSrc:
        'https://scontent.fkiv7-1.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=dst-png_s200x200&_nc_cat=110&ccb=1-7&_nc_sid=136b72&_nc_ohc=mKje_Qww9A4Q7kNvgG4YRdl&_nc_ad=z-m&_nc_cid=1396&_nc_zt=24&_nc_ht=scontent.fkiv7-1.fna&_nc_gid=A0zQGhvjZMya7EY1vtrUps2&oh=00_AYBKj9P_6SKmstVBXe53zc5qsD6bP65Yu7YuGSANbC61Bw&oe=6783833A',
    name: 'Mariana Catruc',
    message: 'Mariana a trimis o ataşare.',
    chatID: '0123',
  },
];

interface ChatData {
  from: string;
  from_img: string;
  sendtype: string;
  messages: string[];
}
const chatData: ChatData[] = [
];

// Define character configuration
const characters: {
  id: string;
  name: string;
  position: 'left' | 'right';
  message: string;
}[] = [
  {
    id: 'mom',
    name: 'mom',
    position: 'left',
    message: 'hello my daughter, go to your room and do your homework',
  },
  {
    id: 'daughter',
    name: 'daughter',
    position: 'right',
    message: 'hello mother',
  },
];

const initialChatData: ChatData[] = [
];

interface ChatData {
  from: string;
  from_img: string;
  sendtype: string;
  messages: string[];
}

const from_img_default ='https://scontent.fkiv7-1.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=dst-png_s200x200&_nc_cat=110&ccb=1-7&_nc_sid=136b72&_nc_ohc=mKje_Qww9A4Q7kNvgG4YRdl&_nc_ad=z-m&_nc_cid=1396&_nc_zt=24&_nc_ht=scontent.fkiv7-1.fna&_nc_gid=A0zQGhvjZMya7EY1vtrUps2&oh=00_AYBKj9P_6SKmstVBXe53zc5qsD6bP65Yu7YuGSANbC61Bw&oe=6783833A';

const Chat: React.FC = () => {

    // If your AuthContext provides the token or isAuthenticated, you can use it here:
    const { isAuthenticated } = useAuth();   // or whatever your context returns
    // Grab the token from localStorage (or from context if you store it there)
    const token = localStorage.getItem('authToken');

    // State to track the currently visible character
    const [visibleCharacter, setVisibleCharacter] = useState<string | null>(null);

    const [popupVisibility, setPopupVisibility] = useState<{ [key: string]: boolean }>({});

    // *** Chat data state ***
    const [chatData, setChatData] = useState<ChatData[]>(initialChatData);

    // *** Option states returned by the AI endpoint ***
    const [option1, setOption1] = useState<string>('');
    const [option2, setOption2] = useState<string>('');
    const [option3, setOption3] = useState<string>('');

    // *** Danger level states ***
    const [dangerLevel1, setDangerLevel1] = useState<number>(0);
    const [dangerLevel2, setDangerLevel2] = useState<number>(0);
    const [dangerLevel3, setDangerLevel3] = useState<number>(0);
    const [updatedDangerLevel, setUpdatedDangerLevel] = useState<number>(0);


  const [isTyping, setIsTyping] = useState<boolean>(false);


    // Toggle function for Character
    const toggleCharacter = (id: string) => {
      setVisibleCharacter((prev) => (prev === id ? null : id));
    };

    // Popup functions
    const showPopup = (id: string) => {
      setPopupVisibility((prev) => ({ ...prev, [id]: true }));
    };
    const hidePopup = (id: string) => {
      setPopupVisibility((prev) => ({ ...prev, [id]: false }));
    };

    // *** This function calls the message-generation endpoint ***
    const fetchAIResponse = async (lastMessage: string, currentDangerLevel: number, isTrafficker: boolean) => {
      setIsTyping(true); // Show typing indicator
      console.log('stop_typing')
      try {
        const response = await fetch(backend_api_generate, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // *** Attach token in the Authorization header ***
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            context: 'A child is chatting with someone online.',
            lastMessage: lastMessage,
            currentDangerLevel: currentDangerLevel,
            isTrafficker: isTrafficker,
          }),
        });

        if (!response.ok) {
          console.error('Error fetching AI response:', response.status, response.statusText);
          return;
        }

        const data = await response.json();
        /*
          Example data structure we expect:
          {
            "dangerLevel3": 7,
            "dangerLevel2": 4,
            "dangerLevel1": 2,
            "updatedDangerLevel": 10,
            "option3": "\"I'd love to hang out! Where would we meet?\"",
            "isTrafficker": true,
            "chatResponse": "\"It's going pretty well, but let's hang out in person...\"",
            "option1": "\"That sounds fun! ...\"",
            "option2": "\"I don't know, meeting in person seems a bit scary...\""
          }
         */

        // Parse out the new data
        setOption1(data.option1 || '');
        setOption2(data.option2 || '');
        setOption3(data.option3 || '');
        setDangerLevel1(data.dangerLevel1 || 0);
        setDangerLevel2(data.dangerLevel2 || 0);
        setDangerLevel3(data.dangerLevel3 || 0);
        setUpdatedDangerLevel(data.updatedDangerLevel || 0);

        // *** Add the AI's chatResponse to the chat as a "got" message ***
        if (data.chatResponse) {
          const cleanedResponse = data.chatResponse.replace(/^"|"$/g, '');
          const newMessage: ChatData = {
            from: 'Alex',
            from_img: 'https://scontent.fkiv7-1.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=dst-png_s200x200&_nc_cat=110&ccb=1-7&_nc_sid=136b72&_nc_ohc=mKje_Qww9A4Q7kNvgG4YRdl&_nc_ad=z-m&_nc_cid=1396&_nc_zt=24&_nc_ht=scontent.fkiv7-1.fna&_nc_gid=A0zQGhvjZMya7EY1vtrUps2&oh=00_AYBKj9P_6SKmstVBXe53zc5qsD6bP65Yu7YuGSANbC61Bw&oe=6783833A',
            sendtype: 'got',
            messages: [cleanedResponse],
          };

          setChatData((prevChatData) => [...prevChatData, newMessage]);
        }
      } catch (error) {
        console.error('Error in fetchAIResponse:', error);
      }
      finally {
        setIsTyping(false); // Hide typing indicator
        console.log('stop_typing')
      }
    };

  // Only run the “Hello” request once
  const hasFetchedRef = useRef(false);

  // *** On Chat load, fetch the initial AI response with "Hello" as lastMessage ***
  useEffect(() => {
    if (!hasFetchedRef.current && isAuthenticated && token) {
      hasFetchedRef.current = true;
      fetchAIResponse('Hello', 3, false);
    }
    // If you don't require auth, remove the isAuthenticated check
    // else { /* maybe handle error, redirect to login, etc. */ }
  }, [isAuthenticated, token]);


    // *** Handler when the user clicks one of the options ***
    const handleOptionClick = (chosenOption: string) => {
      // 1) Add the chosen message to chat as 'send'
      const cleanedOption = chosenOption.replace(/^"|"$/g, '');
      const userMessage: ChatData = {
        from: 'Cristi',
        from_img: 'https://example.com/cristi_image.png',
        sendtype: 'send',
        messages: [cleanedOption],
      };
      setChatData((prevChatData) => [...prevChatData, userMessage]);

      // 2) Fire a new request with chosenOption as lastMessage
      fetchAIResponse(chosenOption, updatedDangerLevel, false);
    };

  return (
      <div className={styles.chat}>
        <div className={styles.chat_leftbar}>
          <div className={styles.chat_leftbar_option}>
            <svg
                width="20"
                height="21"
                viewBox="0 0 20 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
              <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M19.1693 10.5508C19.1693 15.6366 15.3309 19.3591 10.0026 19.3591C9.1151 19.3591 8.26927 19.2799 7.47594 19.0866C6.81851 18.9209 6.12738 18.9469 5.48427 19.1616L2.4276 20.0991C1.93594 20.2674 1.4576 19.7891 1.62427 19.2783L2.23177 17.2691C2.34426 16.925 2.38084 16.5605 2.33898 16.2009C2.29711 15.8412 2.17781 15.4949 1.98927 15.1858C1.18094 13.8674 0.835938 12.2941 0.835938 10.5508V10.5491C0.835938 5.46328 4.6751 1.80078 10.0026 1.80078C15.3301 1.80078 19.1693 5.46328 19.1693 10.5491V10.5508Z"
                  fill="black"
              />
            </svg>
          </div>
          <div
              className={`${styles.chat_leftbar_option} ${styles.chat_leftbar_option_active}`}
          >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="21"
                viewBox="0 0 20 21"
                fill="none"
            >
              <path
                  d="M5.13797 8.36354C4.88038 8.86097 4.46319 9.25748 3.95331 9.48947C3.44344 9.72146 2.87042 9.77548 2.32617 9.64288C1.78192 9.51027 1.29797 9.19873 0.951952 8.75821C0.605929 8.31768 0.417881 7.77371 0.417969 7.21354C0.417969 6.35521 1.2238 4.46854 1.8338 3.16521C2.22964 2.31771 3.0888 1.79688 4.02464 1.79688H15.9788C16.9138 1.79688 17.773 2.31771 18.1688 3.16521C18.7788 4.46854 19.5846 6.35437 19.5846 7.21354C19.5847 7.77371 19.3967 8.31768 19.0507 8.75821C18.7046 9.19873 18.2207 9.51027 17.6764 9.64288C17.1322 9.77548 16.5592 9.72146 16.0493 9.48947C15.5394 9.25748 15.1222 8.86097 14.8646 8.36354C14.8096 8.25854 14.6346 8.25854 14.5796 8.36354C14.3692 8.76995 14.0513 9.11079 13.6605 9.34893C13.2697 9.58707 12.821 9.71337 12.3633 9.71406C11.9057 9.71474 11.4566 9.5898 11.0651 9.35283C10.6736 9.11587 10.3546 8.77598 10.143 8.37021C10.088 8.26521 9.91464 8.26521 9.85964 8.37021C9.64799 8.77598 9.32903 9.11587 8.9375 9.35283C8.54598 9.5898 8.09693 9.71474 7.63928 9.71406C7.18163 9.71337 6.73295 9.58707 6.34214 9.34893C5.95133 9.11079 5.63339 8.76995 5.42297 8.36354C5.36797 8.25854 5.19297 8.25854 5.13797 8.36354ZM5.40047 10.7252C5.36465 10.7023 5.323 10.6901 5.28047 10.6901C5.23793 10.6901 5.19629 10.7023 5.16047 10.7252C4.39653 11.2147 3.49314 11.4401 2.5888 11.3669C2.3263 11.3469 2.08464 11.5427 2.08464 11.8069V18.4602C2.08464 18.9022 2.26023 19.3262 2.57279 19.6387C2.88535 19.9513 3.30927 20.1269 3.7513 20.1269H7.08464C7.30565 20.1269 7.51761 20.0391 7.67389 19.8828C7.83017 19.7265 7.91797 19.5146 7.91797 19.2935V15.1269C7.91797 14.9059 8.00577 14.6939 8.16205 14.5376C8.31833 14.3813 8.53029 14.2935 8.7513 14.2935H11.2513C11.4723 14.2935 11.6843 14.3813 11.8406 14.5376C11.9968 14.6939 12.0846 14.9059 12.0846 15.1269V19.2935C12.0846 19.5146 12.1724 19.7265 12.3287 19.8828C12.485 20.0391 12.697 20.1269 12.918 20.1269H16.2513C16.6933 20.1269 17.1173 19.9513 17.4298 19.6387C17.7424 19.3262 17.918 18.9022 17.918 18.4602V11.8069C17.918 11.5427 17.6763 11.3469 17.4138 11.3677C16.5095 11.4409 15.6061 11.2155 14.8421 10.726C14.8063 10.7031 14.7647 10.6909 14.7221 10.6909C14.6796 10.6909 14.638 10.7031 14.6021 10.726C13.9555 11.1394 13.1855 11.3802 12.3596 11.3802C11.5346 11.3802 10.7671 11.1402 10.1205 10.7277C10.0848 10.7051 10.0435 10.6931 10.0013 10.6931C9.9591 10.6931 9.91777 10.7051 9.88214 10.7277C9.21356 11.155 8.43642 11.3815 7.64297 11.3802C6.84814 11.3813 6.06975 11.1539 5.40047 10.7252Z"
                  fill="#65676B"
              />
            </svg>
          </div>
          <div className={styles.chat_leftbar_option}>
            <svg
                width="20"
                height="21"
                viewBox="0 0 20 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
              <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.0026 19.3591C15.3309 19.3591 19.1693 15.6366 19.1693 10.5508V10.5491C19.1693 5.46328 15.3309 1.80078 10.0026 1.80078C4.67594 1.80078 0.837604 5.46328 0.835938 10.5491V10.5508C0.836771 12.2933 1.18177 13.8674 1.98927 15.1858C2.37094 15.8083 2.45844 16.5724 2.23094 17.2691L1.62427 19.2774C1.4576 19.7891 1.9351 20.2674 2.4276 20.0991L5.48427 19.1616C6.12738 18.9469 6.81851 18.9209 7.47594 19.0866C8.2701 19.2799 9.1151 19.3591 10.0026 19.3591ZM5.83594 12.2141C6.16746 12.2141 6.4854 12.0824 6.71982 11.848C6.95424 11.6136 7.08594 11.2956 7.08594 10.9641C7.08594 10.6326 6.95424 10.3147 6.71982 10.0802C6.4854 9.84581 6.16746 9.71412 5.83594 9.71412C5.50442 9.71412 5.18647 9.84581 4.95205 10.0802C4.71763 10.3147 4.58594 10.6326 4.58594 10.9641C4.58594 11.2956 4.71763 11.6136 4.95205 11.848C5.18647 12.0824 5.50442 12.2141 5.83594 12.2141ZM11.2526 10.9641C11.2526 11.2956 11.1209 11.6136 10.8865 11.848C10.6521 12.0824 10.3341 12.2141 10.0026 12.2141C9.67108 12.2141 9.35314 12.0824 9.11872 11.848C8.8843 11.6136 8.7526 11.2956 8.7526 10.9641C8.7526 10.6326 8.8843 10.3147 9.11872 10.0802C9.35314 9.84581 9.67108 9.71412 10.0026 9.71412C10.3341 9.71412 10.6521 9.84581 10.8865 10.0802C11.1209 10.3147 11.2526 10.6326 11.2526 10.9641ZM15.4193 10.9641C15.4193 11.2956 15.2876 11.6136 15.0532 11.848C14.8187 12.0824 14.5008 12.2141 14.1693 12.2141C13.8377 12.2141 13.5198 12.0824 13.2854 11.848C13.051 11.6136 12.9193 11.2956 12.9193 10.9641C12.9193 10.6326 13.051 10.3147 13.2854 10.0802C13.5198 9.84581 13.8377 9.71412 14.1693 9.71412C14.5008 9.71412 14.8187 9.84581 15.0532 10.0802C15.2876 10.3147 15.4193 10.6326 15.4193 10.9641Z"
                  fill="#65676B"
              />
            </svg>
          </div>
          <div className={styles.chat_leftbar_option}>
            <svg
                width="28"
                height="29"
                viewBox="0 0 28 29"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
              <path
                  d="M5.66927 6.21484C5.44826 6.21484 5.2363 6.30264 5.08002 6.45892C4.92374 6.6152 4.83594 6.82716 4.83594 7.04818V8.29818C4.83594 8.51919 4.92374 8.73115 5.08002 8.88743C5.2363 9.04371 5.44826 9.13151 5.66927 9.13151H22.3359C22.5569 9.13151 22.7689 9.04371 22.9252 8.88743C23.0815 8.73115 23.1693 8.51919 23.1693 8.29818V7.04818C23.1693 6.82716 23.0815 6.6152 22.9252 6.45892C22.7689 6.30264 22.5569 6.21484 22.3359 6.21484H5.66927Z"
                  fill="#65676B"
              />
              <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.50195 11.2135C6.50195 11.103 6.54585 10.9971 6.62399 10.9189C6.70213 10.8408 6.80811 10.7969 6.91862 10.7969H21.0853C21.1958 10.7969 21.3018 10.8408 21.3799 10.9189C21.4581 10.9971 21.502 11.103 21.502 11.2135V21.2135C21.502 21.8766 21.2386 22.5125 20.7697 22.9813C20.3009 23.4501 19.665 23.7135 19.002 23.7135H9.00195C8.33891 23.7135 7.70303 23.4501 7.23419 22.9813C6.76534 22.5125 6.50195 21.8766 6.50195 21.2135V11.2135ZM10.252 13.9219C10.252 13.3469 10.7186 12.8802 11.2936 12.8802H16.7103C16.9866 12.8802 17.2515 12.99 17.4469 13.1853C17.6422 13.3807 17.752 13.6456 17.752 13.9219C17.752 14.1981 17.6422 14.4631 17.4469 14.6584C17.2515 14.8538 16.9866 14.9635 16.7103 14.9635H11.2936C10.7186 14.9635 10.252 14.4969 10.252 13.9219Z"
                  fill="#65676B"
              />
            </svg>
          </div>
        </div>
        <div className={styles.chat_navigation}>
          <div className={styles.chat_navigation_title}>
            Conversaţii
            <div className={styles.chat_navigation_new}>
              <svg
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
              >
                <path
                    d="M9.42229 9.77328C9.30743 9.8882 9.21001 10.0193 9.13312 10.1625L7.84479 12.5541C7.80225 12.6331 7.78631 12.7236 7.79935 12.8124C7.81239 12.9011 7.85372 12.9833 7.91718 13.0466C7.98064 13.11 8.06286 13.1512 8.15161 13.1641C8.24036 13.177 8.3309 13.1609 8.40979 13.1183L10.8015 11.8308C10.944 11.7533 11.0748 11.6558 11.1898 11.5416L18.3823 4.34912C18.4984 4.23306 18.5905 4.09527 18.6534 3.94362C18.7162 3.79196 18.7486 3.62941 18.7486 3.46524C18.7487 3.30108 18.7164 3.13851 18.6536 2.98683C18.5908 2.83514 18.4988 2.69731 18.3827 2.5812C18.2667 2.46509 18.1289 2.37297 17.9772 2.31012C17.8256 2.24726 17.663 2.21488 17.4988 2.21484C17.3347 2.21481 17.1721 2.2471 17.0204 2.30989C16.8687 2.37268 16.7309 2.46473 16.6148 2.58078L9.42229 9.77328Z"
                    fill="#050505"
                />
                <path
                    d="M10.0013 4.71615C10.2223 4.71615 10.4343 4.62835 10.5906 4.47207C10.7468 4.31579 10.8346 4.10383 10.8346 3.88281V3.46615C10.8346 3.24513 10.7468 3.03317 10.5906 2.87689C10.4343 2.72061 10.2223 2.63281 10.0013 2.63281H5.0013C4.11725 2.63281 3.2694 2.984 2.64428 3.60912C2.01916 4.23424 1.66797 5.08209 1.66797 5.96615V15.9661C1.66797 16.8502 2.01916 17.698 2.64428 18.3232C3.2694 18.9483 4.11725 19.2995 5.0013 19.2995H15.0013C15.8854 19.2995 16.7332 18.9483 17.3583 18.3232C17.9834 17.698 18.3346 16.8502 18.3346 15.9661V10.9661C18.3346 10.7451 18.2468 10.5332 18.0906 10.3769C17.9343 10.2206 17.7223 10.1328 17.5013 10.1328H17.0846C16.8636 10.1328 16.6517 10.2206 16.4954 10.3769C16.3391 10.5332 16.2513 10.7451 16.2513 10.9661V15.9661C16.2513 16.2977 16.1196 16.6156 15.8852 16.85C15.6508 17.0844 15.3328 17.2161 15.0013 17.2161H5.0013C4.66978 17.2161 4.35184 17.0844 4.11742 16.85C3.883 16.6156 3.7513 16.2977 3.7513 15.9661V5.96615C3.7513 5.63463 3.883 5.31668 4.11742 5.08226C4.35184 4.84784 4.66978 4.71615 5.0013 4.71615H10.0013Z"
                    fill="#050505"
                />
              </svg>
            </div>
          </div>
          <div className={styles.chat_navigation_search}>
            <svg
                width="20"
                height="21"
                viewBox="0 0 20 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
              <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M14.604 14.0158C14.2798 13.7291 14.2348 13.2449 14.4532 12.8716C15.3217 11.3851 15.6191 9.63316 15.2898 7.94331C14.9605 6.25346 14.027 4.74139 12.6639 3.68979C11.3007 2.63819 9.60123 2.11905 7.88313 2.22942C6.16504 2.3398 4.54596 3.07213 3.32858 4.28951C2.1112 5.50689 1.37886 7.12598 1.26849 8.84407C1.15811 10.5622 1.67725 12.2616 2.72885 13.6248C3.78045 14.9879 5.29252 15.9214 6.98237 16.2507C8.67222 16.58 10.4242 16.2826 11.9107 15.4141C12.2832 15.1966 12.7673 15.2416 13.054 15.5658L16.0607 18.9599C16.1851 19.0992 16.3366 19.2116 16.506 19.2903C16.6754 19.369 16.859 19.4122 17.0457 19.4175C17.2324 19.4227 17.4182 19.3898 17.5917 19.3207C17.7653 19.2516 17.9229 19.1479 18.0549 19.0158C18.1869 18.8837 18.2906 18.7261 18.3596 18.5525C18.4286 18.379 18.4614 18.1932 18.4561 18.0065C18.4508 17.8198 18.4075 17.6362 18.3287 17.4668C18.25 17.2975 18.1375 17.146 17.9982 17.0216L14.604 14.0158ZM11.8707 5.7616C12.3412 6.22444 12.7155 6.77587 12.9718 7.38408C13.2282 7.99229 13.3616 8.64524 13.3644 9.30527C13.3672 9.9653 13.2392 10.6193 12.988 11.2297C12.7367 11.84 12.3671 12.3946 11.9004 12.8613C11.4337 13.3281 10.8793 13.6979 10.269 13.9493C9.65873 14.2007 9.00471 14.3288 8.34468 14.3262C7.68465 14.3236 7.03167 14.1903 6.4234 13.9341C5.81513 13.6778 5.26361 13.3037 4.80066 12.8333C3.8629 11.8956 3.33602 10.6238 3.33595 9.29772C3.33587 7.97161 3.86259 6.69977 4.80024 5.76201C5.73789 4.82425 7.00966 4.29738 8.33578 4.2973C9.6619 4.29722 10.9329 4.82394 11.8707 5.7616Z"
                  fill="black"
                  fillOpacity="0.44"
              />
            </svg>

            <input type="text" placeholder="Caută în Messenger" />
          </div>
          {chatUsers.map((chat, index) => (
              <div key={index} className={styles.chat_navigation_block}>
                <img
                    className={styles.chat_navigation_block_img}
                    src={chat.imgSrc}
                    alt="avatar"
                />
                <div className={styles.chat_navigation_block_text}>
                  <div className={styles.chat_navigation_block_text_name}>
                    {chat.name}
                  </div>
                  <div className={styles.chat_navigation_block_text_message}>
                    {chat.message}
                  </div>
                </div>
              </div>
          ))}
        </div>
        <div className={styles.chat_conversation}>
          <div className={styles.chat_conversation_top}>
            <div className={styles.chat_conversation_top_left}>
              <img
                  className={styles.chat_conversation_top_picture}
                  src={active_chat_img}
                  alt="avatar"
              />
              <span>{active_chat_name}</span>
            </div>

            <div className={styles.chat_conversation_top_right}>
              <div
                  onClick={() => showPopup('popup_1')}
                  className={styles.chat_conversation_top_icons}
              >
                <svg
                    width="20"
                    height="21"
                    viewBox="0 0 20 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                      d="M16.4619 19.4643C17.3536 19.1668 17.9752 18.4018 18.4811 17.6101C18.6518 17.3435 18.7451 17.0347 18.7505 16.7182C18.756 16.4017 18.6734 16.0899 18.5119 15.8176C18.3442 15.5268 18.1419 15.2574 17.9094 15.0151C17.2031 14.3075 16.3912 13.7137 15.5027 13.2551C15.0194 13.0059 14.4427 13.0784 13.9961 13.3876L12.2477 14.5976C12.1953 14.6343 12.1348 14.6576 12.0713 14.6656C12.0079 14.6736 11.9434 14.666 11.8836 14.6434C10.6183 14.1582 9.46964 13.4114 8.51274 12.4518C7.55321 11.4952 6.80638 10.3468 6.32107 9.08178C6.29865 9.02186 6.29118 8.95738 6.29931 8.89392C6.30744 8.83046 6.33093 8.76994 6.36774 8.71762L7.57858 6.96928C7.88691 6.52262 7.95941 5.94595 7.71024 5.46345C7.25204 4.5747 6.65858 3.76252 5.95108 3.05595C5.70885 2.82349 5.43939 2.62119 5.14857 2.45345C4.87637 2.29217 4.56472 2.20965 4.24837 2.2151C3.93203 2.22054 3.6234 2.31373 3.35691 2.48428C2.56441 2.99012 1.79858 3.61178 1.50274 4.50428C0.524408 7.44345 2.49191 11.5551 5.95108 15.0151C9.41108 18.4743 13.5227 20.4418 16.4627 19.4634L16.4619 19.4643Z"
                      fill="#AA00FF"
                  />
                </svg>
              </div>
              <div
                  onClick={() => showPopup('popup_1')}
                  className={styles.chat_conversation_top_icons}
              >
                <svg
                    width="22"
                    height="21"
                    viewBox="0 0 22 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                      d="M3.5013 3.88281C2.61725 3.88281 1.7694 4.234 1.14428 4.85912C0.519158 5.48424 0.167969 6.33209 0.167969 7.21615V14.7161C0.167969 15.6002 0.519158 16.448 1.14428 17.0732C1.7694 17.6983 2.61725 18.0495 3.5013 18.0495H11.8346C12.7187 18.0495 13.5665 17.6983 14.1917 17.0732C14.8168 16.448 15.168 15.6002 15.168 14.7161V7.21615C15.168 6.33209 14.8168 5.48424 14.1917 4.85912C13.5665 4.234 12.7187 3.88281 11.8346 3.88281H3.5013ZM17.5255 13.9095L20.628 15.4603C20.755 15.5239 20.8961 15.5541 21.038 15.5478C21.1799 15.5416 21.3178 15.4991 21.4387 15.4246C21.5596 15.35 21.6595 15.2458 21.7288 15.1218C21.798 14.9978 21.8345 14.8582 21.8346 14.7161V7.21615C21.8346 7.07404 21.7983 6.93429 21.7291 6.81019C21.6598 6.68609 21.56 6.58175 21.4391 6.5071C21.3182 6.43244 21.1802 6.38995 21.0382 6.38366C20.8962 6.37737 20.755 6.40748 20.628 6.47115L17.5255 8.02198C17.3177 8.1259 17.143 8.28567 17.021 8.48336C16.8989 8.68105 16.8344 8.90883 16.8346 9.14115V12.7911C16.8346 13.0233 16.8992 13.2509 17.0212 13.4485C17.1432 13.646 17.3178 13.8056 17.5255 13.9095Z"
                      fill="#AA00FF"
                  />
                </svg>
              </div>
              <div className={styles.chat_conversation_top_icons}>
                <svg
                    width="28"
                    height="29"
                    viewBox="0 0 28 29"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M14.0028 23.5213C18.7279 23.5213 22.5584 19.6908 22.5584 14.9657C22.5584 10.2406 18.7279 6.41016 14.0028 6.41016C9.27774 6.41016 5.44727 10.2406 5.44727 14.9657C5.44727 19.6908 9.27774 23.5213 14.0028 23.5213ZM15.1695 14.9657C15.1695 15.61 14.6471 16.1324 14.0028 16.1324C13.3585 16.1324 12.8362 15.61 12.8362 14.9657C12.8362 14.3214 13.3585 13.799 14.0028 13.799C14.6471 13.799 15.1695 14.3214 15.1695 14.9657ZM17.8917 16.1324C18.536 16.1324 19.0584 15.61 19.0584 14.9657C19.0584 14.3214 18.536 13.799 17.8917 13.799C17.2474 13.799 16.725 14.3214 16.725 14.9657C16.725 15.61 17.2474 16.1324 17.8917 16.1324ZM11.2806 14.9657C11.2806 15.61 10.7582 16.1324 10.1139 16.1324C9.46962 16.1324 8.94727 15.61 8.94727 14.9657C8.94727 14.3214 9.46962 13.799 10.1139 13.799C10.7582 13.799 11.2806 14.3214 11.2806 14.9657Z"
                      fill="#AA00FF"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* MIDDLE: the actual messages */}
          <div className={`${styles.chat_conversation_middle} ${styles.custom_scroll_container}`}>
            {isTyping && (
                <div
                    className={`${styles.chat_conversation_middle_message_box} ${styles.chat_conversation_middle_message_got}`}>
                  <img
                      className={styles.chat_conversation_middle_message_from_img}
                      src={from_img_default}
                      style={{opacity:"0"}}
                      alt="avatar"
                  />
                  <div className={styles.chat_conversation_middle_messages}>
                    <div className={styles.chat_typing_indicator}>
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </div>
                  </div>
                </div>
            )}
            {[...chatData].reverse().map((message, index) => (
                <div
                    key={index}
                    className={`${styles.chat_conversation_middle_message_box} ${
                           message.sendtype === 'send'
                               ? styles.chat_conversation_middle_message_send
                               : styles.chat_conversation_middle_message_got
                       }`}
                   >
                     {message.sendtype === 'got' && (
                         <img
                             className={styles.chat_conversation_middle_message_from_img}
                             src={message.from_img}
                             alt="avatar"
                         />
                     )}
                     <div className={styles.chat_conversation_middle_messages}>
                       {message.sendtype === 'got' && (
                           <div className={`${styles.chat_conversation_middle_message_from}`}>
                             {message.from}
                           </div>
                       )}
                       {message.messages.map((msg, msgIndex) => (
                           <div
                               key={msgIndex}
                               className={styles.chat_conversation_middle_message}
                           >
                             {msg}
                           </div>
                       ))}
                     </div>
                   </div>
               ))}

          </div>
          {/* BOTTOM: replaced input with 3 clickable options */}
          <div className={styles.chat_conversation_bottom}>
            <svg
                onClick={() => showPopup('popup_2')}
                className={styles.chat_pointer}
                width="36"
                height="37"
                viewBox="0 0 36 37"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
              <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.0028 27.5213C22.7278 27.5213 26.5584 23.6907 26.5584 18.9657C26.5584 14.2407 22.7278 10.4102 18.0028 10.4102C13.2778 10.4102 9.44727 14.2407 9.44727 18.9657C9.44727 23.6907 13.2778 27.5213 18.0028 27.5213ZM17.225 15.0768C17.225 14.8705 17.307 14.6727 17.4528 14.5269C17.5987 14.381 17.7965 14.299 18.0028 14.299C18.2091 14.299 18.4069 14.381 18.5528 14.5269C18.6987 14.6727 18.7806 14.8705 18.7806 15.0768V17.9935C18.7806 18.1008 18.8677 18.1879 18.975 18.1879H21.8917C22.098 18.1879 22.2958 18.2699 22.4417 18.4157C22.5875 18.5616 22.6695 18.7594 22.6695 18.9657C22.6695 19.172 22.5875 19.3698 22.4417 19.5157C22.2958 19.6615 22.098 19.7435 21.8917 19.7435H18.975C18.9235 19.7435 18.874 19.764 18.8376 19.8004C18.8011 19.8369 18.7806 19.8864 18.7806 19.9379V22.8546C18.7806 23.0609 18.6987 23.2587 18.5528 23.4046C18.4069 23.5504 18.2091 23.6324 18.0028 23.6324C17.7965 23.6324 17.5987 23.5504 17.4528 23.4046C17.307 23.2587 17.225 23.0609 17.225 22.8546V19.9379C17.225 19.8864 17.2046 19.8369 17.1681 19.8004C17.1316 19.764 17.0822 19.7435 17.0306 19.7435H14.1139C13.9077 19.7435 13.7098 19.6615 13.564 19.5157C13.4181 19.3698 13.3362 19.172 13.3362 18.9657C13.3362 18.7594 13.4181 18.5616 13.564 18.4157C13.7098 18.2699 13.9077 18.1879 14.1139 18.1879H17.0306C17.0822 18.1879 17.1316 18.1674 17.1681 18.131C17.2046 18.0945 17.225 18.0451 17.225 17.9935V15.0768Z"
                  fill="#0080FF"
              />
            </svg>
            <svg
                onClick={() => showPopup('popup_2')}
                className={styles.chat_pointer}
                width="36"
                height="37"
                viewBox="0 0 36 37"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
              <path
                  d="M14.5028 17.7986C14.9154 17.7986 15.311 17.6347 15.6028 17.343C15.8945 17.0513 16.0584 16.6556 16.0584 16.2431C16.0584 15.8305 15.8945 15.4348 15.6028 15.1431C15.311 14.8514 14.9154 14.6875 14.5028 14.6875C14.0903 14.6875 13.6946 14.8514 13.4029 15.1431C13.1112 15.4348 12.9473 15.8305 12.9473 16.2431C12.9473 16.6556 13.1112 17.0513 13.4029 17.343C13.6946 17.6347 14.0903 17.7986 14.5028 17.7986Z"
                  fill="#0080FF"
              />
              <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.44727 14.2986V23.6319C9.44727 24.4571 9.77504 25.2484 10.3585 25.8318C10.9419 26.4153 11.7333 26.7431 12.5584 26.7431H23.4473C24.2724 26.7431 25.0637 26.4153 25.6472 25.8318C26.2306 25.2484 26.5584 24.4571 26.5584 23.6319V14.2986C26.5584 13.4735 26.2306 12.6822 25.6472 12.0987C25.0637 11.5153 24.2724 11.1875 23.4473 11.1875H12.5584C11.7333 11.1875 10.9419 11.5153 10.3585 12.0987C9.77504 12.6822 9.44727 13.4735 9.44727 14.2986ZM23.4473 13.1319H12.5584C12.249 13.1319 11.9522 13.2549 11.7334 13.4737C11.5146 13.6924 11.3917 13.9892 11.3917 14.2986V21.7233C11.3916 21.7574 11.4006 21.791 11.4176 21.8206C11.4347 21.8502 11.4592 21.8748 11.4888 21.892C11.5183 21.9091 11.5519 21.9181 11.5861 21.9181C11.6202 21.9181 11.6538 21.9091 11.6834 21.8921L15.6695 19.5898C16.3789 19.1802 17.1836 18.9646 18.0028 18.9646C18.822 18.9646 19.6267 19.1802 20.3362 19.5898L24.3223 21.8921C24.3519 21.9091 24.3854 21.9181 24.4196 21.9181C24.4537 21.9181 24.4873 21.9091 24.5169 21.892C24.5464 21.8748 24.571 21.8502 24.588 21.8206C24.6051 21.791 24.614 21.7574 24.6139 21.7233V14.2986C24.6139 13.9892 24.491 13.6924 24.2722 13.4737C24.0534 13.2549 23.7567 13.1319 23.4473 13.1319Z"
                  fill="#0080FF"
              />
            </svg>

            <svg
                onClick={() => showPopup('popup_2')}
                className={styles.chat_pointer}
                width="36"
                height="37"
                viewBox="0 0 36 37"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
              <path
                  d="M10.2246 14.2986C10.2246 13.4735 10.5524 12.6822 11.1358 12.0987C11.7193 11.5153 12.5106 11.1875 13.3357 11.1875H22.6691C23.4942 11.1875 24.2855 11.5153 24.8689 12.0987C25.4524 12.6822 25.7802 13.4735 25.7802 14.2986V18.1875C25.7802 18.3938 25.6982 18.5916 25.5524 18.7375C25.4065 18.8833 25.2087 18.9653 25.0024 18.9653H22.6691C21.4314 18.9653 20.2444 19.4569 19.3692 20.3321C18.4941 21.2073 18.0024 22.3943 18.0024 23.6319V25.9653C18.0024 26.1716 17.9204 26.3694 17.7746 26.5153C17.6287 26.6611 17.4309 26.7431 17.2246 26.7431H13.3357C12.5106 26.7431 11.7193 26.4153 11.1358 25.8318C10.5524 25.2484 10.2246 24.4571 10.2246 23.6319V14.2986Z"
                  fill="#0080FF"
              />
              <path
                  d="M19.5566 25.964C19.5566 26.6562 20.3943 26.9984 20.8843 26.5084L25.5455 21.8472C26.0355 21.3572 25.6933 20.5195 25.0011 20.5195H22.6678C21.8426 20.5195 21.0513 20.8473 20.4679 21.4308C19.8844 22.0142 19.5566 22.8055 19.5566 23.6306V25.964Z"
                  fill="#0080FF"
              />
            </svg>

            <svg
                onClick={() => showPopup('popup_2')}
                className={styles.chat_pointer}
                width="36"
                height="37"
                viewBox="0 0 36 37"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
              <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.66797 13.5213C8.66797 12.6961 8.99575 11.9048 9.57919 11.3214C10.1626 10.7379 10.954 10.4102 11.7791 10.4102H18.0013C18.8312 10.4102 19.5841 10.7345 20.1425 11.2642C20.5446 11.646 21.0377 11.9657 21.5939 11.9657H24.2235C25.0486 11.9657 25.84 12.2935 26.4234 12.8769C27.0069 13.4604 27.3346 14.2517 27.3346 15.0768V24.4102C27.3346 25.2353 27.0069 26.0266 26.4234 26.61C25.84 27.1935 25.0486 27.5213 24.2235 27.5213H18.0013C17.2046 27.5222 16.4381 27.2164 15.8609 26.6673C15.458 26.2854 14.9649 25.9657 14.4095 25.9657H11.7791C10.954 25.9657 10.1626 25.6379 9.57919 25.0545C8.99575 24.471 8.66797 23.6797 8.66797 22.8546V13.5213ZM14.7852 17.3386C14.4984 17.0974 14.1323 16.971 13.7577 16.9839C13.3992 16.9995 13.0437 17.1504 12.7505 17.4319C12.4565 17.7143 12.245 18.1109 12.1641 18.5652C12.0839 19.0143 12.1406 19.4771 12.3266 19.8936C12.5102 20.298 12.8019 20.6053 13.1402 20.7803C13.4652 20.9519 13.8431 20.9941 14.198 20.8985C14.5511 20.8036 14.8824 20.5726 15.1274 20.2234C15.2036 20.1145 15.2697 19.997 15.3242 19.8726C15.3771 19.7528 15.2837 19.6268 15.1531 19.6268H13.9957C13.8204 19.6268 13.6523 19.5572 13.5283 19.4332C13.4043 19.3092 13.3346 19.141 13.3346 18.9657C13.3346 18.7904 13.4043 18.6222 13.5283 18.4982C13.6523 18.3743 13.8204 18.3046 13.9957 18.3046H16.1735C16.5391 18.3046 16.8346 18.6002 16.8346 18.9657C16.8375 19.686 16.6195 20.3899 16.2101 20.9825C15.8002 21.5658 15.2169 21.9936 14.5425 22.1756C13.8681 22.3573 13.1499 22.2782 12.5312 21.9539C11.909 21.6319 11.419 21.0929 11.1226 20.4396C10.8264 19.7801 10.7356 19.0467 10.8621 18.3349C10.9817 17.6286 11.3221 16.9784 11.8343 16.4776C12.3358 15.9876 12.9991 15.6977 13.6994 15.6625C14.3988 15.6351 15.0835 15.8673 15.6221 16.3143C15.7579 16.4252 15.8441 16.5856 15.8617 16.7602C15.8793 16.9347 15.8268 17.109 15.7158 17.2449C15.6048 17.3807 15.4444 17.4669 15.2699 17.4845C15.0954 17.5021 14.921 17.4496 14.7852 17.3386ZM21.6569 20.2102C21.6569 20.1586 21.6773 20.1091 21.7138 20.0727C21.7503 20.0362 21.7997 20.0157 21.8513 20.0157H23.9902C24.1655 20.0157 24.3337 19.9461 24.4577 19.8221C24.5817 19.6981 24.6513 19.5299 24.6513 19.3546C24.6513 19.1793 24.5817 19.0111 24.4577 18.8871C24.3337 18.7631 24.1655 18.6935 23.9902 18.6935H21.8513C21.7997 18.6935 21.7503 18.673 21.7138 18.6365C21.6773 18.6001 21.6569 18.5506 21.6569 18.499V17.3713C21.6569 17.3197 21.6773 17.2702 21.7138 17.2338C21.7503 17.1973 21.7997 17.1768 21.8513 17.1768H24.3402C24.5155 17.1768 24.6837 17.1072 24.8077 16.9832C24.9317 16.8592 25.0013 16.691 25.0013 16.5157C25.0013 16.3404 24.9317 16.1722 24.8077 16.0482C24.6837 15.9243 24.5155 15.8546 24.3402 15.8546H20.9957C20.8204 15.8546 20.6523 15.9243 20.5283 16.0482C20.4043 16.1722 20.3346 16.3404 20.3346 16.5157V21.4157C20.3346 21.591 20.4043 21.7592 20.5283 21.8832C20.6523 22.0072 20.8204 22.0768 20.9957 22.0768C21.1711 22.0768 21.3392 22.0072 21.4632 21.8832C21.5872 21.7592 21.6569 21.591 21.6569 21.4157V20.2102ZM19.0513 16.5157C19.0513 16.3404 18.9816 16.1722 18.8577 16.0482C18.7337 15.9243 18.5655 15.8546 18.3902 15.8546C18.2149 15.8546 18.0467 15.9243 17.9227 16.0482C17.7987 16.1722 17.7291 16.3404 17.7291 16.5157V21.4157C17.7291 21.591 17.7987 21.7592 17.9227 21.8832C18.0467 22.0072 18.2149 22.0768 18.3902 22.0768C18.5655 22.0768 18.7337 22.0072 18.8577 21.8832C18.9816 21.7592 19.0513 21.591 19.0513 21.4157V16.5157Z"
                  fill="#0080FF"
              />
            </svg>

            {/*<input*/}
            {/*    className={styles.chat_conversation_bottom_input}*/}
            {/*    type="text"*/}
            {/*    placeholder="Aa"*/}
            {/*/>*/}

            <div className={styles.chat_options}>
              {/* Option1 */}
              <div
                  className={`${styles.chat_option} ${styles.chat_conversation_bottom_option}`}
                  onClick={() => handleOptionClick(option1)}
              >
                {option1 || "Option1..."}
              </div>

              {/* Option2 */}
              <div
                  className={`${styles.chat_option} ${styles.chat_conversation_bottom_option}`}
                  onClick={() => handleOptionClick(option2)}
              >
                {option2 || "Option2..."}
              </div>

              {/* Option3 */}
              <div
                  className={`${styles.chat_option} ${styles.chat_conversation_bottom_option}`}
                  onClick={() => handleOptionClick(option3)}
              >
                {option3 || "Option3..."}
              </div>
            </div>

            {/*<svg*/}
            {/*    className={`${styles.chat_pointer} $styles.chat_conversation_bottom_icon}`}*/}
            {/*    width="36"*/}
            {/*    height="37"*/}
            {/*    viewBox="0 0 36 37"*/}
            {/*    fill="none"*/}
            {/*    xmlns="http://www.w3.org/2000/svg"*/}
            {/*>*/}
            {/*  <path*/}
            {/*      fillRule="evenodd"*/}
            {/*      clipRule="evenodd"*/}
            {/*      d="M18.0028 27.5213C22.7278 27.5213 26.5584 23.6907 26.5584 18.9657C26.5584 14.2407 22.7278 10.4102 18.0028 10.4102C13.2778 10.4102 9.44727 14.2407 9.44727 18.9657C9.44727 23.6907 13.2778 27.5213 18.0028 27.5213ZM13.9195 17.4102C13.9195 16.4379 14.3574 15.8546 15.0862 15.8546C15.8157 15.8546 16.2528 16.4379 16.2528 17.4102C16.2528 18.3824 15.8149 18.9657 15.0862 18.9657C14.3566 18.9657 13.9195 18.3824 13.9195 17.4102ZM19.7528 17.4102C19.7528 16.4379 20.1907 15.8546 20.9195 15.8546C21.649 15.8546 22.0862 16.4379 22.0862 17.4102C22.0862 18.3824 21.6483 18.9657 20.9195 18.9657C20.1899 18.9657 19.7528 18.3824 19.7528 17.4102ZM13.9039 21.6599C13.9698 21.5817 14.0504 21.5173 14.1412 21.4703C14.2319 21.4233 14.3311 21.3946 14.4329 21.3859C14.5348 21.3773 14.6373 21.3888 14.7347 21.4198C14.8321 21.4508 14.9225 21.5007 15.0006 21.5666C15.8394 22.2745 16.9021 22.662 17.9997 22.6602C19.143 22.6602 20.1876 22.2495 20.9988 21.5666C21.0769 21.5001 21.1673 21.4496 21.2649 21.4182C21.3625 21.3867 21.4654 21.3749 21.5676 21.3833C21.6698 21.3918 21.7693 21.4204 21.8604 21.4674C21.9515 21.5145 22.0324 21.5791 22.0984 21.6576C22.1645 21.736 22.2144 21.8268 22.2452 21.9246C22.276 22.0224 22.2872 22.1253 22.2781 22.2274C22.269 22.3296 22.2398 22.4289 22.1922 22.5197C22.1446 22.6105 22.0795 22.691 22.0006 22.7566C20.8814 23.7007 19.4639 24.2176 17.9997 24.2157C16.5354 24.2174 15.1179 23.7002 13.9988 22.7558C13.841 22.623 13.7425 22.4329 13.7248 22.2274C13.7072 22.0219 13.7719 21.8177 13.9047 21.6599H13.9039Z"*/}
            {/*      fill="#0080FF"*/}
            {/*  />*/}
            {/*</svg>*/}

            <svg
                className={styles.chat_pointer}
                width="36"
                height="37"
                viewBox="0 0 36 37"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                onClick={async () => {
                  handleOptionClick("👍");
                }}
                style={{cursor: "pointer"}}
            >
              <path
                  d="M17.9914 8.96484C18.9514 8.96484 21.1827 9.59615 21.1827 13.4422C21.1827 14.5135 21.0758 15.1822 21.001 15.6457C20.9862 15.7366 20.9723 15.8276 20.9592 15.9188L20.9584 15.9231C20.9526 15.9676 20.9565 16.0128 20.9698 16.0556C20.983 16.0985 21.0053 16.138 21.0352 16.1715C21.065 16.2049 21.1017 16.2316 21.1428 16.2497C21.1838 16.2677 21.2283 16.2768 21.2732 16.2761C25.0984 16.2761 27.141 17.2883 27.141 18.3222C27.141 18.7857 26.9671 19.2092 26.6827 19.5353C26.6739 19.5456 26.6675 19.5576 26.6637 19.5706C26.6599 19.5836 26.6589 19.5973 26.6608 19.6106C26.6627 19.624 26.6674 19.6369 26.6747 19.6483C26.6819 19.6598 26.6914 19.6695 26.7027 19.677C26.9656 19.8432 27.1824 20.0729 27.3332 20.3449C27.484 20.6169 27.5638 20.9225 27.5653 21.2335C27.5653 21.9814 27.1505 22.6231 26.5088 22.9231C26.4967 22.9289 26.486 22.9372 26.4773 22.9474C26.4686 22.9576 26.4622 22.9696 26.4584 22.9825C26.4546 22.9953 26.4536 23.0089 26.4554 23.0221C26.4572 23.0354 26.4618 23.0482 26.4688 23.0596C26.6488 23.3448 26.7549 23.6796 26.7549 24.0405C26.7549 24.8631 26.2792 25.5544 25.5323 25.8048C25.5088 25.813 25.4894 25.83 25.4783 25.8523C25.4673 25.8746 25.4654 25.9003 25.4732 25.924C25.5262 26.084 25.5584 26.2544 25.5584 26.4318C25.5584 27.3501 24.014 28.0953 20.3845 28.0953C17.7323 28.0953 15.9027 27.6214 15.1992 27.2814C14.6818 27.0309 14.0897 26.577 14.0897 25.2466V19.9544C14.0897 18.4588 14.9227 17.4588 15.7514 16.464C16.574 15.4779 17.394 14.4953 17.394 13.0353C17.394 11.8701 17.3149 11.1309 17.2558 10.5857C17.2218 10.2657 17.1949 10.0118 17.1949 9.77876C17.1949 9.3205 17.5288 8.96658 17.9914 8.96484ZM11.481 18.5301H9.74185C8.87228 18.5301 8.4375 20.8657 8.4375 23.7475C8.4375 26.6292 8.87228 28.9648 9.74185 28.9648H11.481C11.7116 28.9648 11.9328 28.8732 12.0959 28.7102C12.2589 28.5471 12.3505 28.3259 12.3505 28.0953V19.3996C12.3505 19.169 12.2589 18.9478 12.0959 18.7848C11.9328 18.6217 11.7116 18.5301 11.481 18.5301Z"
                  fill="#0080FF"
              />
            </svg>
          </div>
        </div>
        <div className={styles.chat_info}>
          <div className={styles.chat_info_btn}>Chat info</div>
          <div
              className={`${styles.chat_info_btn}  ${styles.chat_info_help}`}
          >
            Help
          </div>
          <div
              className={`${styles.chat_info_btn} ${styles.chat_info_report} `}
          >
            Report
          </div>

          <div className={styles.chat_info_test}>
            {characters.map((character) => (
                <div
                    key={character.id}
                    className={styles.chat_info_btn}
                    onClick={() => toggleCharacter(character.id)}
                >
                  Toggle {character.name}
                </div>
            ))}
          </div>
        </div>

        {characters.map((character) => (
            <Character
                key={character.id}
                isVisible={visibleCharacter === character.id}
                character={character.name.toLowerCase()}
                altText={`${character.name} character`}
                position={character.position}
                message={character.message}
            />
        ))}

        {/* Popup 1 */}
        {popupVisibility['popup_1'] && (
            <div className={styles.chat_popup_container}>
              <div className={styles.chat_popup}>
                <div className={styles.chat_popup_text}>
                  Are you sure you want to contact this person?
                </div>
                <div className={styles.chat_popup_buttons}>
                  <div
                      className={`${styles.chat_info_btn} ${styles.chat_info_halth} ${styles.chat_info_help}`}
                  >
                    yes
                  </div>
                  <div
                      className={`${styles.chat_info_btn} ${styles.chat_info_report} ${styles.chat_info_halth}`}
                      onClick={() => hidePopup('popup_1')}
                  >
                    no
                  </div>
                </div>
              </div>
            </div>
        )}
        {popupVisibility['popup_2'] && (
            <div className={styles.chat_popup_container}>
              <div className={styles.chat_popup}>
                <div className={styles.chat_popup_text}>
                  Are you sure you want share pictures this person?
                </div>
                <div className={styles.chat_popup_buttons}>
                  <div
                      className={`${styles.chat_info_btn} ${styles.chat_info_halth} ${styles.chat_info_help}`}
                  >
                    yes
                  </div>
                  <div
                      className={`${styles.chat_info_btn} ${styles.chat_info_report} ${styles.chat_info_halth}`}
                      onClick={() => hidePopup('popup_2')}
                  >
                    no
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default Chat;

