import React, { useState, useEffect } from 'react';
import { Box, Paper, Tabs, Tab, Typography, Avatar } from '@mui/material';
import { useConfigStore } from '../../store/configStore';
import { usePortfolioStore } from '../../store/portfolioStore';
import { getCryptoPrices } from '../../services/priceService';

const formatMarketCap = (value: number | undefined) => {
  if (value === undefined || value === null) return 'N/A';
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

const ASSET_LOGOS: Record<string, string> = {
  SOL: "https://cryptologos.cc/logos/solana-sol-logo.png",
  USDC: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  USDT: "https://cryptologos.cc/logos/tether-usdt-logo.png",
  BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
  ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.png",

};
const ASSETS = [
  
  { symbol: 'SOL', name: 'Solana', id: 'solana' },
  { symbol: 'USDC', name: 'USD Coin', id: 'usd-coin' },
  { symbol: 'USDT', name: 'Tether', id: 'tether' },
  { symbol: 'BTC', name: 'Bitcoin', id: 'bitcoin' },
  { symbol: 'ETH', name: 'Ethereum', id: 'ethereum' }
];

const textos = {
  es: { misActivos: 'Mis Activos', mercado: 'Mercado', cargando: 'Cargando...' },
  en: { misActivos: 'My Assets', mercado: 'Market', cargando: 'Loading...' },
};

export const AssetTabs = () => {
  const [activeTab, setActiveTab] = useState<'activos' | 'mercado'>('activos');
  const [prices, setPrices] = useState<any>(null);
  const idioma = useConfigStore((state) => state.idioma);
  const t = textos[idioma] || textos.es;
  const saldos = usePortfolioStore((state) => state.saldos);

  useEffect(() => {
    const loadPrices = async () => {
      try {
        const data = await getCryptoPrices();
        setPrices(data);
      } catch (error) {
        console.error("Error cargando precios:", error);
      }
    };
    loadPrices();
    const intervalId = setInterval(loadPrices, 15000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <Tabs
        value={activeTab}
        onChange={(_, valor) => setActiveTab(valor)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab value="activos" label={t.misActivos} sx={{ fontWeight: 700, textTransform: 'none' }} />
        <Tab value="mercado" label={t.mercado} sx={{ fontWeight: 700, textTransform: 'none' }} />
      </Tabs>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {prices ? (
          ASSETS.map((asset) => {
            const p = prices[asset.id];
            const saldo = saldos[asset.symbol as keyof typeof saldos];

            return (
              <AssetRow
                key={asset.id}
                symbol={asset.symbol}
                name={asset.name}
                subLeft={activeTab === 'mercado' ? formatMarketCap(p?.usd_market_cap) : ''}
                rightTop={
                  activeTab === 'activos'
                    ? `$${saldo.valorUsd.toFixed(2)}`
                    : `$${p?.usd?.toLocaleString() || 'N/A'}`
                }
                rightBottom={
                  activeTab === 'activos'
                    ? `${saldo.cantidad.toFixed(4)} ${asset.symbol}`
                    : `${p?.usd_24h_change?.toFixed(2) || '0'}%`
                }
                isMarket={activeTab === 'mercado'}
                changeValue={p?.usd_24h_change}
              />
            );
          })
        ) : (
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            {t.cargando}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

interface AssetRowProps {
  symbol: string;
  name: string;
  subLeft: string;
  rightTop: string;
  rightBottom: string;
  isMarket: boolean;
  changeValue?: number;
}

const AssetRow = ({ symbol, name, subLeft, rightTop, rightBottom, isMarket, changeValue }: AssetRowProps) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      p: 2,
      borderRadius: 3,
      transition: 'background-color 0.2s',
      '&:hover': { backgroundColor: 'action.hover' },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar src={ASSET_LOGOS[symbol]} alt={name} sx={{ width: 40, height: 40, bgcolor: 'background.default' }} />
      <Box>
        <Typography fontWeight="bold" color="text.primary">{name}</Typography>
        <Typography variant="caption" color="text.secondary">{subLeft}</Typography>
      </Box>
    </Box>

    <Box sx={{ textAlign: 'right' }}>
      <Typography fontWeight="bold" color="text.primary">{rightTop}</Typography>
      <Typography
        variant="caption"
        fontWeight={600}
        sx={{
          color: isMarket
            ? (changeValue !== undefined && changeValue >= 0 ? 'success.main' : 'error.main')
            : 'primary.main',
        }}
      >
        {rightBottom}
      </Typography>
    </Box>
  </Box>
);