import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  CameraIcon, 
  BoltIcon, 
  UserGroupIcon, 
  QrCodeIcon 
} from '@heroicons/react/24/outline';

export const Home: React.FC = () => {
  const features = [
    {
      icon: CameraIcon,
      title: 'Scan Bills',
      description: 'Use your camera or upload images to scan bills instantly with AI-powered OCR',
    },
    {
      icon: BoltIcon,
      title: 'Auto-Detect Total',
      description: 'Smart detection automatically finds the total amount from your receipt',
    },
    {
      icon: UserGroupIcon,
      title: 'Split Equally',
      description: 'Divide the bill among participants with automatic calculation',
    },
    {
      icon: QrCodeIcon,
      title: 'UPI Payment',
      description: 'Generate UPI links and QR codes for instant payment collection',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-bold text-gradient mb-6"
        >
          Split Bills in Seconds
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
        >
          Scan, split, and collect payments instantly with AI-powered bill recognition and UPI integration
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link to="/scan">
            <Button className="text-lg px-8 py-4">
              <CameraIcon className="h-6 w-6 mr-2 inline" />
              Start Scanning
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="text-center h-full">
                <feature.icon className="h-12 w-12 mx-auto text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-12 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to simplify bill splitting?</h2>
        <p className="text-xl mb-8 opacity-90">Join thousands of users who split bills effortlessly</p>
        <Link to="/register">
          <Button variant="secondary" className="text-lg px-8 py-4">
            Get Started Free
          </Button>
        </Link>
      </section>
    </div>
  );
};
