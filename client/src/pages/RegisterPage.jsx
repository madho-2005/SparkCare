import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../redux/authSlice';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Mail, Lock, User, Phone, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const role = 'user'; // Standard customer account registration
  const [validationErrors, setValidationErrors] = useState({});

  const { loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!name) {
      errors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!email) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email address';
    }

    if (!phoneNumber) {
      errors.phoneNumber = 'Phone number is required';
    } else if (phoneNumber.trim().length < 10) {
      errors.phoneNumber = 'Phone number must be at least 10 digits';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      errors.password = 'Password must include uppercase, lowercase, and numeric characters';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});

    try {
      await dispatch(registerUser({ name, email, password, phoneNumber, role })).unwrap();
      toast.success('Registration successful! Welcome to SparkCare.');
      navigate('/');
    } catch (err) {
      toast.error(err || 'Registration failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-text-main">Create Account</h2>
        <p className="mt-2 text-sm text-text-muted font-medium">
          Get access to verified home electrical services and electrical supplies.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3.5 text-xs font-semibold text-center flex items-center justify-center gap-2">
          <ShieldCheck size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          id="name"
          type="text"
          icon={<User size={18} />}
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={validationErrors.name}
        />

        <Input
          label="Email Address"
          id="email"
          type="email"
          icon={<Mail size={18} />}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={validationErrors.email}
        />

        <Input
          label="Phone Number"
          id="phone"
          type="tel"
          icon={<Phone size={18} />}
          placeholder="1234567890"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          error={validationErrors.phoneNumber}
        />

        <Input
          label="Password"
          id="password"
          type="password"
          icon={<Lock size={18} />}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={validationErrors.password}
        />

        <p className="text-xs text-text-muted text-center pt-1 leading-relaxed">
          By creating an account, you agree to our{' '}
          <Link to="/terms-and-conditions" className="text-primary hover:underline font-bold">
            Terms & Conditions
          </Link>{' '}
          and{' '}
          <Link to="/privacy-policy" className="text-primary hover:underline font-bold">
            Privacy Policy
          </Link>
          .
        </p>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3 cursor-pointer"
          loading={loading}
        >
          Create Account
        </Button>
      </form>

      <div className="text-center text-sm text-text-muted font-semibold mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:text-primary-light transition-colors font-bold">
          Sign In Here
        </Link>
      </div>
    </div>
  );
};
export default RegisterPage;