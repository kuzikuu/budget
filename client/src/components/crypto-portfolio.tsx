import { useQuery } from "@tanstack/react-query";

const HOUSEHOLD_ID = "default-household";

interface CryptoHolding {
  id: string;
  symbol: string;
  name: string;
  amount: string;
  platform: string | null;
  priceUsd: number;
  usdValue: number;
}

interface CryptoPortfolioData {
  holdings: CryptoHolding[];
  totalUsdValue: number;
}

export default function CryptoPortfolio() {
  const { data: cryptoData, isLoading } = useQuery<CryptoPortfolioData>({
    queryKey: ["/api/crypto", HOUSEHOLD_ID],
    refetchInterval: 60000, // Refresh every minute for live prices
  });

  if (isLoading) {
    return (
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Crypto Portfolio</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-gray-200 rounded-lg"></div>
          <div className="h-12 bg-gray-200 rounded-lg"></div>
          <div className="h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </section>
    );
  }

  const { holdings = [], totalUsdValue = 0 } = cryptoData || {};

  if (holdings.length === 0) {
    return (
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Crypto Portfolio</h2>
        <div className="text-center py-8 text-neutral">
          <i className="fab fa-bitcoin text-4xl mb-4 opacity-50"></i>
          <p>No crypto holdings found. Add your first cryptocurrency investment!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Crypto Portfolio</h2>
        <div className="text-right">
          <div className="text-sm text-neutral">Total Value</div>
          <div className="text-xl font-semibold text-secondary" data-testid="text-total-crypto-value">
            ${totalUsdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {holdings.map((holding) => (
          <div key={holding.id} className="flex items-center justify-between p-4 bg-surface rounded-lg" data-testid={`crypto-holding-${holding.id}`}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm" data-testid={`text-crypto-symbol-${holding.id}`}>
                  {holding.symbol}
                </span>
              </div>
              <div>
                <div className="font-medium text-slate-800" data-testid={`text-crypto-name-${holding.id}`}>
                  {holding.name}
                </div>
                <div className="text-sm text-neutral flex items-center space-x-2">
                  <span data-testid={`text-crypto-amount-${holding.id}`}>
                    {parseFloat(holding.amount).toFixed(8)} {holding.symbol}
                  </span>
                  {holding.platform && (
                    <>
                      <span>•</span>
                      <span data-testid={`text-crypto-platform-${holding.id}`}>{holding.platform}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-slate-800" data-testid={`text-crypto-usd-value-${holding.id}`}>
                ${holding.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-neutral" data-testid={`text-crypto-price-${holding.id}`}>
                ${holding.priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {holding.symbol}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-surface rounded-lg">
        <div className="flex items-center space-x-2 mb-3">
          <i className="fas fa-info-circle text-primary"></i>
          <span className="text-sm font-medium text-slate-800">Live Prices</span>
        </div>
        <div className="text-sm text-neutral">
          Prices are updated every minute from live market data. Portfolio value reflects current market conditions.
        </div>
      </div>
    </section>
  );
}