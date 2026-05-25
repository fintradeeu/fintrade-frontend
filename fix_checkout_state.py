import re

with open('c:/work/fintrade/fintrade-frontend/app/pages/student/CourseEnrollment.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add payment method state
state_injection = '''
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "Card" | "NetBanking">("UPI");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
'''
content = content.replace('  const [showPayment, setShowPayment] = useState(false);', state_injection)

# Replace payment buttons
old_buttons = '''            <div className="grid grid-cols-3 gap-3">
              <button className="p-4 border-2 border-[#C2A86A] bg-[#C2A86A]/10 rounded-lg font-semibold text-[#0B2A5B] hover:bg-[#C2A86A]/20 transition-colors">
                UPI
              </button>
              <button className="p-4 border-2 border-[#0B2A5B]/20 rounded-lg font-semibold text-[#0B2A5B] hover:bg-[#F4F1EA] transition-colors">
                Card
              </button>
              <button className="p-4 border-2 border-[#0B2A5B]/20 rounded-lg font-semibold text-[#0B2A5B] hover:bg-[#F4F1EA] transition-colors">
                NetBanking
              </button>
            </div>'''

new_buttons = '''            <div className="grid grid-cols-3 gap-3">
              {["UPI", "Card", "NetBanking"].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method as any)}
                  className={p-4 border-2 rounded-lg font-semibold transition-colors }
                >
                  {method}
                </button>
              ))}
            </div>'''
content = content.replace(old_buttons, new_buttons)

# Modify completePayment
old_complete = '''  const completePayment = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      await api.post(/courses//enroll, { distributor_code: couponCode });
      alert("Payment successful! Welcome to the course.");
      window.location.href = "/student/modules";
    } catch (err: any) {
      alert(err.response?.data?.detail || "Enrollment failed.");
    } finally {
      setLoading(false);
    }
  };'''

new_complete = '''  const completePayment = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    setPaymentProcessing(true);
    
    // Simulate Razorpay overlay delay
    setTimeout(async () => {
      try {
        await api.post(/courses//enroll, { distributor_code: couponCode });
        setPaymentProcessing(false);
        alert(Payment of ? via  successful! Welcome to the course.);
        window.location.href = "/student/modules";
      } catch (err: any) {
        setPaymentProcessing(false);
        alert(err.response?.data?.detail || "Enrollment failed.");
      } finally {
        setLoading(false);
      }
    }, 2500);
  };'''
content = content.replace(old_complete, new_complete)

with open('c:/work/fintrade/fintrade-frontend/app/pages/student/CourseEnrollment.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("CourseEnrollment.tsx checkout fixed")
