import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaCertificate, FaUserGraduate, FaLaptop } from 'react-icons/fa';

const Home = () => {
  const features = [
    {
      icon: <FaBook className="text-4xl text-primary-600" />,
      title: 'Extensive Course Library',
      description: 'Access hundreds of courses across various disciplines and skill levels.',
    },
    {
      icon: <FaCertificate className="text-4xl text-primary-600" />,
      title: 'Recognized Certificates',
      description: 'Earn certificates upon course completion to showcase your achievements.',
    },
    {
      icon: <FaUserGraduate className="text-4xl text-primary-600" />,
      title: 'Expert Instructors',
      description: 'Learn from industry professionals with real-world experience.',
    },
    {
      icon: <FaLaptop className="text-4xl text-primary-600" />,
      title: 'Interactive Learning',
      description: 'Engage with quizzes, projects, and collaborative activities.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Developer',
      image: '/images/testimonials/sarah.jpg',
      quote: 'LearnHub transformed my career. The courses were comprehensive and the instructors were fantastic. I landed my dream job within weeks of completing the program.',
    },
    {
      name: 'Michael Chen',
      role: 'Data Analyst',
      image: '/images/testimonials/michael.jpg',
      quote: 'The structured curriculum and practical assignments helped me master complex concepts quickly. I highly recommend LearnHub to anyone looking to advance their skills.',
    },
    {
      name: 'Priya Patel',
      role: 'Digital Marketing Specialist',
      image: '/images/testimonials/priya.jpg',
      quote: 'LearnHub offers exceptional value. The courses cover cutting-edge topics and the platform is incredibly user-friendly. It\'s been a game-changer for my professional development.',
    },
  ];

  const categories = [
    'Web Development', 'Data Science', 'Business', 'Design',
    'Marketing', 'IT & Software', 'Personal Development', 'Photography',
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Expand Your Knowledge and Skills with LearnHub
              </h1>
              <p className="text-lg text-white/90 mb-6">
                Access expert-led courses, earn recognized certificates, and advance your career through interactive learning experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/courses" className="bg-white text-primary-600 font-semibold px-6 py-3 rounded-lg text-center hover:bg-gray-100 transition">
                  Explore Courses
                </Link>
                <Link to="/register" className="text-white border border-white px-6 py-3 rounded-lg text-center hover:bg-white hover:text-primary-600 transition">
                  Sign Up Free
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img
                src="/images/hero-illustration.svg"
                alt="Online learning illustration"
                className="w-full max-w-lg mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose LearnHub</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Explore Our Categories</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Discover courses across various disciplines designed to help you achieve your personal and professional goals.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/courses?category=${category.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-gray-100 hover:bg-primary-50 text-gray-800 hover:text-primary-600 px-6 py-3 rounded-full transition-colors"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Students Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/default-avatar.png';
                    }}
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-primary-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-lg max-w-2xl mx-auto mb-8">
            Join thousands of students who are already advancing their careers with LearnHub.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition"
            >
              Sign Up Free
            </Link>
            <Link
              to="/courses"
              className="border border-white px-8 py-3 rounded-lg hover:bg-white hover:text-primary-600 transition"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
