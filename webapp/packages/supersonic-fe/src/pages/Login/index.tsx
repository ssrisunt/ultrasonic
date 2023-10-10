// import type { FC } from 'react';
import styles from './style.less';
import { Button, Form, Input, message, Space } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import RegisterForm from './components/RegisterForm';
// import ForgetPwdForm from './components/ForgetPwdForm';
import S2Icon, { ICON } from '@/components/S2Icon';
import React, { useState } from 'react';
import { useForm } from 'antd/lib/form/Form';
import type { RegisterFormDetail } from './components/types';
import { postUserLogin, userRegister } from './services';
import { AUTH_TOKEN_KEY } from '@/common/constants';
import { queryCurrentUser } from '@/services/user';
import { history, useModel } from 'umi';

const { Item } = Form;
const LoginPage: React.FC = () => {
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  // const [forgetModalVisible, setForgetModalVisible] = useState<boolean>(false);
  const [form] = useForm();
  const { initialState = {}, setInitialState } = useModel('@@initialState');
  // Log in with your user information
  const loginDone = async (values: RegisterFormDetail) => {
    const { code, data, msg } = await postUserLogin(values);
    if (code === 200) {
      localStorage.setItem(AUTH_TOKEN_KEY, data);
      const { code: queryUserCode, data: queryUserData } = await queryCurrentUser();
      if (queryUserCode === 200) {
        const currentUser = {
          ...queryUserData,
          staffName: queryUserData.staffName || queryUserData.name,
        };
        setInitialState({ ...initialState, currentUser });
      }
      history.push('/');
      return;
    }
    message.success(msg);
  };

  // Handle the sign-in button response
  const handleLogin = async () => {
    const { validateFields } = form;
    const content = await validateFields();
    await loginDone(content);
  };

  // Handle the registration pop-up OK button
  const handleRegister = async (values: RegisterFormDetail) => {
    const { code } = await userRegister({ ...values });
    if (code === 200) {
      message.success('Registration successful');
      setCreateModalVisible(false);
      // After registration, the user is automatically logged in
      await loginDone(values);
    }
  };

  // Register button accordingly
  const handleRegisterBtn = () => {
    setCreateModalVisible(true);
  };

  // // The Forgot Password pop-up window confirms the response
  // const handleForgetPwd = async (values: RegisterFormDetail) => {
  //   await getUserForgetPwd({ ...values });
  //   message.success('发送邮件成功，请在收到邮件后进入邮件链接进行密码重置');
  //   setForgetModalVisible(false);
  // };

  // // 响应忘记密码按钮
  // const handleForgetPwdBtn = () => {
  //   setForgetModalVisible(true);
  // };

  return (
    <div className={styles.loginWarp}>
      <div className={styles.content}>
        <div className={styles.formContent}>
          <div className={styles.formBox}>
            <Form form={form} labelCol={{ span: 6 }} colon={false}>
              <div className={styles.loginMain}>
                <h3 className={styles.title}>
                  <Space>
                    <S2Icon
                      icon={ICON.iconlogobiaoshi}
                      size={30}
                      color="#296DF3"
                      style={{ display: 'inline-block', marginTop: 8 }}
                    />
                    <div>UltraSonic (SuperSonic)</div>
                  </Space>
                </h3>
                <Item name="name" rules={[{ required: true }]} label="">
                  <Input size="large" placeholder="User name: admin" prefix={<UserOutlined />} />
                </Item>
                <Item name="password" rules={[{ required: true }]} label="">
                  <Input
                    size="large"
                    type="password"
                    placeholder="Password: admin"
                    onPressEnter={handleLogin}
                    prefix={<LockOutlined />}
                  />
                </Item>

                <Button className={styles.signInBtn} type="primary" onClick={handleLogin}>
                  Login
                </Button>

                <div className={styles.tool}>
                  <Button className={styles.button} onClick={handleRegisterBtn}>
                   Enroll
                  </Button>
                  {/* <Button className={styles.button} type="link" onClick={handleForgetPwdBtn}>
              Forgot password
            </Button> */}
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
      <RegisterForm
        onCancel={() => {
          setCreateModalVisible(false);
        }}
        onSubmit={handleRegister}
        createModalVisible={createModalVisible}
      />
    </div>
  );
};

export default LoginPage;
