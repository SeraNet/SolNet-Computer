import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ResponsiveDemo() {
  return (
    <div className="container-fluid space-fluid-lg">
      <div className="text-center mb-8">
        <h1 className="text-fluid-4xl font-bold mb-4">Responsive Scaling Demo</h1>
        <p className="text-fluid-lg text-gray-600">
          Watch how elements scale as you resize your browser window
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Fluid Card */}
        <Card className="card-fluid hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-fluid-xl">Fluid Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-fluid-base mb-4">
              This card uses responsive scaling. The padding, font size, and border radius 
              automatically adjust based on screen size.
            </p>
            <Button className="responsive-button w-full">
              Responsive Button
            </Button>
          </CardContent>
        </Card>

        {/* Regular Card for Comparison */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Regular Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base mb-4">
              This card uses fixed sizing. Notice how it doesn't scale with screen size.
            </p>
            <Button className="px-6 py-3 w-full">
              Regular Button
            </Button>
          </CardContent>
        </Card>

        {/* Fluid Typography Demo */}
        <Card className="card-fluid hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-fluid-2xl">Typography Scale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="text-fluid-xl">Large Heading</h3>
              <h4 className="text-fluid-lg">Medium Heading</h4>
              <p className="text-fluid-base">Base text size</p>
              <p className="text-fluid-sm">Small text</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fluid Modal Demo */}
      <div className="mt-8 text-center">
        <Button 
          className="responsive-button"
          onClick={() => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
            modal.innerHTML = `
              <div class="modal-fluid bg-white rounded-lg shadow-xl">
                <div class="p-6">
                  <h2 class="text-fluid-2xl font-bold mb-4">Fluid Modal</h2>
                  <p class="text-fluid-base mb-6">
                    This modal scales with screen size using fluid sizing.
                  </p>
                  <button 
                    class="responsive-button bg-blue-600 text-white"
                    onclick="this.closest('.fixed').remove()"
                  >
                    Close
                  </button>
                </div>
              </div>
            `;
            document.body.appendChild(modal);
          }}
        >
          Open Fluid Modal
        </Button>
      </div>
    </div>
  );
}






