import { Input } from 'antd';
import styles from './style.module.less';
import { useEffect, useState } from 'react';
import ChatItem from '../components/ChatItem';
import { queryContext, searchRecommend } from '../service';

const { Search } = Input;

const Chat = () => {
  const [data, setData] = useState<any>();
  const [inputMsg, setInputMsg] = useState('');
  const [msg, setMsg] = useState('');
  const [followQuestions, setFollowQuestions] = useState<string[]>([]);
  const [triggerResize, setTriggerResize] = useState(false);

  const onWindowResize = () => {
    setTriggerResize(true);
    setTimeout(() => {
      setTriggerResize(false);
    }, 0);
  };

  useEffect(() => {
    window.addEventListener('resize', onWindowResize);
    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInputMsg(value);
  };

  const onSearch = () => {
    setMsg(inputMsg);
  };

  const onMsgDataLoaded = (msgData: any) => {
    setData(msgData);
    setFollowQuestions(['Test 1234 test', 'Test 1234 test', 'Test 1234 test']);
  };

  // 5: 查信息，6: 智能圈选

  return (
    <div className={styles.page}>
      <div className={styles.inputMsg}>
        <Search
          placeholder="Please enter a question"
          value={inputMsg}
          onChange={onInputChange}
          onSearch={onSearch}
        />
      </div>
      {inputMsg && (
        <div className={styles.chatItem}>
          <ChatItem
            msg={msg}
            // msgData={data}
            agentId={6}
            onMsgDataLoaded={onMsgDataLoaded}
            isLastMessage
            triggerResize={triggerResize}
          />
        </div>
      )}
    </div>
  );
};

export default Chat;
