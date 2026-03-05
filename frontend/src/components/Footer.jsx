import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-dark border-t border-border mt-auto"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              JK ELECTRICAL & HARDWARES
            </h3>
            <p className="text-textSecondary text-sm">
              Your trusted partner for all electrical and hardware needs.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact Information</h4>
            <div className="space-y-2 text-sm text-textSecondary">
              <p>
                <span className="font-medium">Address:</span> Building No./Flat No.: 19, Sri Kodisamy Nagar, Customs Road, Nattapattu, Cuddalore, Tamil Nadu – 607109
              </p>
              <p>
                <span className="font-medium">Phone:</span> +91 98941 23711
              </p>
              <p>
                <span className="font-medium">Email:</span> jkelectricalandhardware@gmail.com
              </p>
              <p>
                <span className="font-medium">Owner:</span> Mr. J. Dineshraj
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <a href="/products" className="block text-textSecondary hover:text-primary-400 transition-colors">
                Products
              </a>
              <a href="/orders" className="block text-textSecondary hover:text-primary-400 transition-colors">
                My Orders
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-textSecondary">
          <p>&copy; {new Date().getFullYear()} JK Electrical & Hardwares. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
