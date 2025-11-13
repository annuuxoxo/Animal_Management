import { Button } from './ui/button';
import { Leaf } from 'lucide-react';

interface TitlePageProps {
  onEnter: () => void;
}

export default function TitlePage({ onEnter }: TitlePageProps) {
  return (
    <div className="size-full min-h-screen flex items-center justify-center p-8">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="flex justify-center mb-8">
          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-full">
            <Leaf className="w-24 h-24 text-white" />
          </div>
        </div>
        
        <h1 className="text-white text-6xl">Wild Care Pro - Animal Management System</h1>
        
        <p className="text-white/90 text-xl">
          Comprehensive facility management for animal care, health tracking, breeding, inventory, and staff coordination
        </p>
        
        <div className="pt-8">
          <Button 
            onClick={onEnter}
            className="bg-white text-[#4a7c59] hover:bg-white/90 px-12 py-6 text-xl rounded-xl shadow-2xl"
          >
            Enter System
          </Button>
        </div>
        
        <div className="pt-12 text-white/70">
          <p>Manage • Track • Optimize • Analyze</p>
        </div>
      </div>
    </div>
  );
}
