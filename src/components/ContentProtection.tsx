'use client';

import React, { useEffect } from 'react';

/**
 * コンテンツ保護用のクライアントコンポーネント
 * - 右クリック禁止
 * - Pull-to-Refresh禁止
 */
export const ContentProtection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useEffect(() => {
        // 右クリック禁止
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    return (
        <div className="min-h-screen overflow-y-auto overscroll-none">
            {children}
        </div>
    );
};
