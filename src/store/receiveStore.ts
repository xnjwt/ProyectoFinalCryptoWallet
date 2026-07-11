import { create } from 'zustand';

interface ReceiveState {
  selectedNetwork: string;
  smartQrActive: boolean;
  receiveAmount: string;
  selectedToken: string;
  setNetwork: (network: string) => void;
  setSmartQrActive: (active: boolean) => void;
  setReceiveAmount: (amount: string) => void;
  setToken: (token: string) => void;
}

export const useReceiveStore = create<ReceiveState>((set) => ({
  selectedNetwork: 'Solana',
  smartQrActive: true,
  receiveAmount: '',
  selectedToken: 'USDC',
  setNetwork: (network) => {

    const defaultToken = network === 'Solana' ? 'USDC' : network === 'Ethereum' ? 'USDT' : 'BTC';
    set({ selectedNetwork: network, selectedToken: defaultToken });
  },
  setSmartQrActive: (active) => set({ smartQrActive: active }),
  setReceiveAmount: (amount) => set({ receiveAmount: amount }),
  setToken: (token) => set({ selectedToken: token })
}));