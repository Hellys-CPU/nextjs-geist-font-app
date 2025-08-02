import VehicleTracker from '@/components/dashboard/VehicleTracker';

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-4xl corporate-heading">
            Dashboard de Rastreamento
          </h1>
          <p className="text-lg corporate-subheading text-muted-foreground">
            Acompanhe em tempo real os veículos que atendem as rotas da Amazon
          </p>
        </div>
        
        <div className="mt-6">
          <img 
            src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/f89f1d6a-bd44-4013-9c68-44609b6193cb.png" 
            alt="Elegant corporate dashboard banner with clean typography and minimalistic layout showing logistics operations" 
            className="w-full h-48 object-cover rounded-lg shadow-sm"
          />
        </div>
      </div>
      
      <VehicleTracker />
    </div>
  );
}
