import { useState } from 'react';
import logoImage from '../assets/logo.svg';
import { Plus, X } from 'phosphor-react';
import * as Dialog from '@radix-ui/react-dialog';
import { NewHabitForm } from './NewHabitForm';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

export const Header = () => {

  const { user } = useAuth();

  return (
    <div className={clsx("w-full max-w-4xl mx-auto flex items-center", {
      'justify-between': user !== null,
      'justify-center': user === null,
    })}
    >
      <img src={logoImage} alt="habits" />
      {
        user && (
          <Dialog.Root>
            <Dialog.Trigger
              type="button"
              className="border border-violet-500 font-semibold rounded-lg px-6 py-4 flex items-center gap-3 hover:border-violet-300 transition-colors
          focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-background
          "
            >
              <Plus size={20} className="text-violet-500" />
              Novo Hábito
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay
                className="w-screen h-screen bg-black/80 fixed inset-0"
              />
              <Dialog.Content className="absolute p-10 bg-zinc-900 rounded-2xl w-full max-w-md top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Dialog.Close className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-200">
                  <X size={24} aria-label="Fechar" className="focus:outline-none rounded-lg focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-black/80" />
                </Dialog.Close>
                <Dialog.Title
                  className="text-3xl font-bold text-zinc-100 mb-6"
                >
                  Criar Hábito
                </Dialog.Title>
                Conteúdo
                <NewHabitForm />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )
      }

    </div>
  )
}
