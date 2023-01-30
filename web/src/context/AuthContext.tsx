import nookies, { setCookie } from 'nookies';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail as resetEmail,
  sendEmailVerification,
  User,
  signOut as signOutFirebase,
} from 'firebase/auth';
import axios from 'axios';
import { api } from '../lib/axios';
import { Navigate, useNavigate } from 'react-router-dom';


interface IAuthContextProvider {
  children: React.ReactNode;
}

type UserSignWithEmailData = {
  email: string;
  password: string;
};

type AuthContextProps = {
  user: User | null;
  signUpWithEmail: ({ email, password }: UserSignWithEmailData) => Promise<void>;
  signInWithEmail: ({ email, password }: UserSignWithEmailData) => Promise<void>;
  sendPasswordResetEmail: (email: string) => void;
  signOut: () => void;
  isLoggingIn: boolean;
}

const AuthContext = createContext({} as AuthContextProps);


export const AuthProvider = ({ children }: IAuthContextProvider) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLogginIn] = useState<boolean>(false);

  const navigate = useNavigate();

  const signUpWithEmail = async ({ email, password }: UserSignWithEmailData) => {
    try {
      setIsLogginIn(true);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      if (!user.emailVerified) {
        await sendEmailVerification(user);
      }

      await api.post('/register', {
        email: user.email,
        firebaseId: user.uid,
      });
    } catch (error) {
      console.log(error)
    } finally {
      setIsLogginIn(false);
    }
  }

  const signInWithEmail = async ({ email, password }: UserSignWithEmailData) => {
    try {
      setIsLogginIn(true);
      await signInWithEmailAndPassword(auth, email, password);

      // console.log('auth.currentUser', auth.currentUser?.uid)
      await api.post('/checkuserexists', {
        email,
        firebaseId: auth.currentUser!.uid,
      });
    } catch (error) {
      console.log(error)
    } finally {
      setIsLogginIn(false);
    }
  }

  const sendPasswordResetEmail = async (email: string) => {
    try {
      setIsLogginIn(true);
      //check email on db
      const userMail = api.get('/api/resetemail', { params: { email } });

      if (!userMail) {
        console.log('Email não cadastrado')
      }

      await resetEmail(auth, email);
    } catch (error) {
      console.log(error)
    } finally {
      setIsLogginIn(false);
    }
  }

  const signOut = async () => {
    try {
      await signOutFirebase(auth);
      setUser(null);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    return auth.onIdTokenChanged(
      async (user) => {
        if (!user) {
          setUser(null);
          nookies.destroy(undefined, "token");
          return navigate('/')
        }

        const token = await user.getIdToken();

        setUser(auth.currentUser);
        nookies.set(undefined, "token", token, { path: '/' });
      });
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoggingIn, signInWithEmail, signUpWithEmail, signOut, sendPasswordResetEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
