'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Zap, Crown, Rocket } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  subscriptionTier: string | null;
}

export default function PricingPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const plans = [
    {
      name: 'Free',
      icon: Zap,
      price: '$0',
      period: '/month',
      description: 'Perfect for trying out AI Studio',
      credits: '100 credits/month',
      features: [
        '100 credits per month',
        'Access to all AI models',
        'HD quality output',
        'Standard processing speed',
        'Community support',
        'Basic analytics',
      ],
      tier: 'free',
      buttonText: 'Current Plan',
      highlighted: false,
    },
    {
      name: 'Basic',
      icon: Rocket,
      price: '$19',
      period: '/month',
      description: 'Great for individual creators',
      credits: '1,000 credits/month',
      features: [
        '1,000 credits per month',
        'Access to all AI models',
        'Full HD quality output',
        'Faster processing speed',
        'Priority email support',
        'Advanced analytics',
        'Commercial use allowed',
      ],
      tier: 'basic',
      buttonText: 'Upgrade to Basic',
      highlighted: false,
    },
    {
      name: 'Pro',
      icon: Crown,
      price: '$29',
      period: '/month',
      description: 'Best for professionals',
      credits: '2,000 credits/month',
      features: [
        '2,000 credits per month',
        'Access to all premium AI models',
        '4K quality output',
        'Priority processing',
        'Priority chat support',
        'Full analytics dashboard',
        'Commercial use allowed',
        'API access',
        'Custom watermark removal',
      ],
      tier: 'pro',
      buttonText: 'Upgrade to Pro',
      highlighted: true,
    },
    {
      name: 'Unlimited',
      icon: Crown,
      price: '$99',
      period: '/month',
      description: 'For power users and teams',
      credits: 'Unlimited credits',
      features: [
        'Unlimited credits',
        'Access to all models including beta',
        '8K quality output',
        'Fastest processing',
        'Dedicated support',
        'Full analytics & reporting',
        'Commercial use allowed',
        'Full API access',
        'Custom integrations',
        'Team collaboration',
        'White-label options',
      ],
      tier: 'unlimited',
      buttonText: 'Contact Sales',
      highlighted: false,
    },
  ];

  const handleSubscribe = (tier: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    // In production, integrate with payment gateway
    alert(`Subscribing to ${tier} plan. Payment integration coming soon!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your creative needs. All plans include access to our powerful AI models.
          </p>
        </div>

        {/* Payment Methods */}
        <div className="mb-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-center font-semibold text-gray-900 mb-4">
            We Accept Multiple Payment Methods
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-6">
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                VISA
              </div>
              <span className="text-sm font-medium">Visa</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold text-xs">
                MC
              </div>
              <span className="text-sm font-medium">Mastercard</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold text-xs">
                JC
              </div>
              <span className="text-sm font-medium">JazzCash</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-xs">
                EP
              </div>
              <span className="text-sm font-medium">Easypaisa</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-white font-bold text-xs">
                BT
              </div>
              <span className="text-sm font-medium">Bank Transfer</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = user?.subscriptionTier === plan.tier;

            return (
              <div
                key={plan.tier}
                className={`relative bg-white rounded-2xl shadow-lg transition-transform hover:scale-105 ${
                  plan.highlighted ? 'ring-2 ring-blue-600 transform scale-105' : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-6 h-6 text-blue-600" />
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    </div>
                    {isCurrentPlan && (
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>

                  <p className="text-gray-600 mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <div className="inline-flex items-center bg-blue-50 text-blue-600 text-sm font-semibold px-3 py-1 rounded-full">
                      {plan.credits}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(plan.tier)}
                    disabled={isCurrentPlan}
                    variant={plan.highlighted ? 'default' : 'outline'}
                    className="w-full"
                  >
                    {isCurrentPlan ? 'Current Plan' : plan.buttonText}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What are credits?</h3>
              <p className="text-gray-600 text-sm">
                Credits are used to generate AI content. Each type of generation uses different amounts:
                1 credit for images, 10 for videos.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600 text-sm">
                Yes! You can cancel your subscription at any time. You'll retain access until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 text-sm">
                We accept international cards (Visa, Mastercard) and Pakistani payment methods (JazzCash, Easypaisa, Bank Transfer).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do credits roll over?</h3>
              <p className="text-gray-600 text-sm">
                Monthly credits reset each billing cycle. Unused credits don't roll over to the next month.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
