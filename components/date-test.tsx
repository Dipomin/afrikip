import React from 'react';
import Date from './date';

// Composant de test pour vérifier le fonctionnement du composant Date
const DateTest: React.FC = () => {
  const testDates = [
    "2024-01-15T10:30:00Z",           // Format ISO standard
    "2024-01-15T10:30:00.000Z",      // Format ISO avec millisecondes
    "2024-01-15",                    // Format date simple
    "2024-01-15 10:30:00",           // Format datetime sans timezone
    "Mon Jan 15 2024 10:30:00",      // Format JavaScript standard
    "invalid-date",                  // Date invalide
    "",                              // Chaîne vide
    "2024-13-45",                    // Date impossible
    "2024-01-15T25:70:90Z",          // Heure impossible
  ];

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Test du composant Date</h2>
      <div className="space-y-2">
        {testDates.map((dateString, index) => (
          <div key={index} className="flex items-center space-x-4 p-2 bg-white rounded border">
            <div className="w-1/2 text-sm font-mono text-gray-600">
              {dateString || '(chaîne vide)'}
            </div>
            <div className="w-1/2">
              <Date dateString={dateString} />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Test avec options</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-4 p-2 bg-white rounded border">
            <div className="w-1/2 text-sm">Avec heure :</div>
            <div className="w-1/2">
              <Date dateString="2024-01-15T10:30:00Z" showTime={true} />
            </div>
          </div>
          <div className="flex items-center space-x-4 p-2 bg-white rounded border">
            <div className="w-1/2 text-sm">Format personnalisé :</div>
            <div className="w-1/2">
              <Date dateString="2024-01-15T10:30:00Z" formatString="dd/MM/yyyy" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateTest;
