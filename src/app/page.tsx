'use client';

import { useState } from 'react';
import { createWallet, getAccount, AccountDetails } from './wallet';

export default function WalletPage() {
  const [mnemonic, setMnemonic] = useState<string>('');
  const [wallets, setWallets] = useState<AccountDetails[]>([]);
  const [inputPhrase, setInputPhrase] = useState<string>('');
  const [showPrivateKey, setShowPrivateKey] = useState<{ [key: number]: boolean }>({});
  const [showSecretPhrase, setShowSecretPhrase] = useState<boolean>(false);

  const handleGenerateWallet = () => {
    try {
      let finalMnemonic = inputPhrase.trim();
      
      // If no input phrase, generate a new one
      if (!finalMnemonic) {
        const { mnemonic: newMnemonic } = createWallet();
        finalMnemonic = newMnemonic;
      }
      
      // Set the mnemonic and create first wallet
      setMnemonic(finalMnemonic);
      const firstWallet = getAccount(finalMnemonic, 0);
      setWallets([firstWallet]);
      setInputPhrase('');
      setShowSecretPhrase(false);
    } catch (error) {
      console.error('Error generating wallet:', error);
      alert('Failed to generate wallet. Please check your recovery phrase.');
    }
  };

  const handleAddWallet = () => {
    try {
      const newIndex = wallets.length;
      const newWallet = getAccount(mnemonic, newIndex);
      setWallets(prev => [...prev, newWallet]);
    } catch (error) {
      console.error('Error adding wallet:', error);
      alert('Failed to add wallet. Please try again.');
    }
  };

  const handleDeleteWallet = (indexToDelete: number) => {
    setWallets(prev => prev.filter((_, index) => index !== indexToDelete));
    // Update showPrivateKey state to remove the deleted wallet's entry
    setShowPrivateKey(prev => {
      const newState = { ...prev };
      delete newState[indexToDelete];
      // Re-index remaining entries
      const reindexed: { [key: number]: boolean } = {};
      Object.keys(newState).forEach(key => {
        const oldIndex = parseInt(key);
        if (oldIndex > indexToDelete) {
          reindexed[oldIndex - 1] = newState[oldIndex];
        } else if (oldIndex < indexToDelete) {
          reindexed[oldIndex] = newState[oldIndex];
        }
      });
      return reindexed;
    });
  };

  const handleClearWallets = () => {
    setWallets([]);
    setMnemonic('');
    setShowPrivateKey({});
    setShowSecretPhrase(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const togglePrivateKey = (index: number) => {
    setShowPrivateKey(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Secret Phrase Section */}
                 {mnemonic && (
           <div className="mb-10 border border-gray-700 rounded-lg">
             <button
               onClick={() => setShowSecretPhrase(!showSecretPhrase)}
               className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-800 rounded-lg"
             >
               <h2 className="text-2xl font-semibold">Your Secret Phrase</h2>
              <svg 
                className={`w-5 h-5 transform transition-transform ${showSecretPhrase ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
                         {showSecretPhrase && (
               <div className="p-6 border-t border-gray-700">
                 <div className="grid grid-cols-3 gap-3 mb-6">
                   {mnemonic.split(' ').map((word, index) => (
                     <div key={index} className="bg-gray-800 px-4 py-3 rounded-lg text-center text-base">
                       {index + 1}. {word}
                     </div>
                   ))}
                 </div>
                 <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
                   <p className="text-red-200 text-base">
                     <strong>⚠️ Security Warning:</strong> Never share your recovery phrase with anyone. 
                     Store it securely - it provides complete access to your wallet.
                   </p>
                 </div>
               </div>
             )}
          </div>
        )}

        {/* Main Wallet Section */}
                 <div className="mb-10">
           <div className="flex items-center justify-between mb-8">
             <h1 className="text-4xl font-bold">Solana Wallet</h1>
            <div className="flex gap-3">
                             {wallets.length > 0 && (
                 <button
                   onClick={handleAddWallet}
                   className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                 >
                   Add Wallet
                 </button>
               )}
               {wallets.length > 0 && (
                 <button
                   onClick={handleClearWallets}
                   className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                 >
                   Clear Wallets
                 </button>
               )}
            </div>
          </div>

          {/* Wallets List */}
                     <div className="space-y-6">
             {wallets.map((wallet, index) => (
               <div key={index} className="border border-gray-700 rounded-lg p-6">
                                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-2xl font-bold">Wallet {index + 1}</h3>
                   <button
                     onClick={() => handleDeleteWallet(index)}
                     className="text-red-400 hover:text-red-300"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                     </svg>
                   </button>
                 </div>

                                 <div className="space-y-6">
                   <div>
                     <label className="block text-lg font-medium text-gray-300 mb-3">
                       Public Key
                     </label>
                     <div className="flex items-center gap-4">
                       <code className="flex-1 bg-gray-800 px-4 py-3 rounded-lg text-base font-mono break-all">
                         {wallet.publicKey}
                       </code>
                       <button
                         onClick={() => copyToClipboard(wallet.publicKey)}
                         className="text-blue-400 hover:text-blue-300 text-base px-3 py-1 rounded border border-blue-400 hover:border-blue-300"
                       >
                         Copy
                       </button>
                     </div>
                   </div>

                   <div>
                     <label className="block text-lg font-medium text-gray-300 mb-3">
                       Private Key
                     </label>
                     <div className="flex items-center gap-4">
                       <code className="flex-1 bg-gray-800 px-4 py-3 rounded-lg text-base font-mono break-all">
                         {showPrivateKey[index] ? wallet.privateKey : '•'.repeat(80)}
                       </code>
                       <button
                         onClick={() => togglePrivateKey(index)}
                         className="text-gray-400 hover:text-gray-300 p-2 rounded border border-gray-600 hover:border-gray-500"
                       >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           {showPrivateKey[index] ? (
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-0.415-0.415M21.75 21.75l-2.939-2.939m-0.811-0.811L8.464 8.464M21.75 21.75L8.464 8.464m0 0L5.515 5.515m0 0L2.929 2.929" />
                           ) : (
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                           )}
                         </svg>
                       </button>
                       {showPrivateKey[index] && (
                         <button
                           onClick={() => copyToClipboard(wallet.privateKey)}
                           className="text-blue-400 hover:text-blue-300 text-base px-3 py-1 rounded border border-blue-400 hover:border-blue-300"
                         >
                           Copy
                         </button>
                       )}
                     </div>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Wallet Section */}
                 {wallets.length === 0 && (
           <div className="text-center">
             <h2 className="text-4xl font-bold mb-6">Secret Recovery Phrase</h2>
             <p className="text-gray-400 mb-10 text-lg">Save these words in a safe place.</p>
             
             <div className="max-w-4xl mx-auto">
               <input
                 type="text"
                 value={inputPhrase}
                 onChange={(e) => setInputPhrase(e.target.value)}
                 placeholder="Enter your secret phrase (or leave blank to generate)"
                 className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-8 text-lg"
               />
               
               <button
                 onClick={handleGenerateWallet}
                 className="px-10 py-4 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-semibold text-lg"
               >
                 Generate Wallet
               </button>
             </div>
           </div>
         )}

      </div>
    </div>
  );
}
