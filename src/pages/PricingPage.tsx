import React from 'react';
import Button from '../components/ui/Button';

const PricingPage: React.FC = () => (
  <div className="container mx-auto px-6 py-12">
    <h1 className="text-4xl font-bold mb-6 text-center text-stone-800">Pricing Plans</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="border p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Free</h2>
        <p className="text-4xl font-bold mb-4 text-stone-800">&#8377; 0</p>
        <ul className="space-y-2 mb-6 text-stone-600">
          <li>Basic Interview Practice</li>
          <li>Limited Resume Reviews</li>
        </ul>
        <Button className="w-full bg-blue-600 text-white py-2 rounded-md">Choose Plan</Button>
      </div>
      <div className="border p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Pro</h2>
        <p className="text-4xl font-bold mb-4 text-stone-800">&#8377;  199/mo</p>
        <ul className="space-y-2 mb-6 text-stone-600">
          <li>Unlimited Interview Practice</li>
          <li>Unlimited Resume Reviews</li>
          <li>Progress Tracking Analytics</li>
        </ul>
        <Button className="w-full bg-blue-600 text-white py-2 rounded-md">Choose Plan</Button>
      </div>
      <div className="border p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Colleges/Intitutes</h2>
        <p className="text-4xl font-bold mb-4 text-stone-800">Contact Us</p>
        <ul className="space-y-2 mb-6 text-stone-600">
          <li>Custom Solutions for students</li>
          <li>Dedicated Support</li>
          <li>Team Management</li>
        </ul>
        <Button className="w-full bg-blue-600 text-white py-2 rounded-md">Contact Sales</Button>
      </div>
    </div>
  </div>
);

export default PricingPage; 