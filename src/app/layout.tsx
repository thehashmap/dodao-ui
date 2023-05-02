'use client';
import NavigationWrapper from '@/components/main/NavigationWrapper';
import AaveTheme from '@/components/themes/AaveTheme';
import CompoundTheme from '@/components/themes/CompoundTheme';
import GlobalTheme from '@/components/themes/GlobalTheme';
import UniswapTheme from '@/components/themes/UniswapTheme';
import './globals.css';

// Based on - https://tailwindui.com/components/application-ui/page-examples/home-screens

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isThemeCompound = true;
  const isThemeAave = false;
  const isThemeUniswap = false;

  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <GlobalTheme />
        {isThemeUniswap && <UniswapTheme />}
        {isThemeAave && <AaveTheme />}
        {isThemeCompound && <CompoundTheme />}
        <NavigationWrapper />
        <main className="lg:pr-96">{children}</main>
      </body>
    </html>
  );
}
