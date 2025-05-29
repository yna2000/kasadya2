
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield, FileText } from 'lucide-react';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const TermsAndConditionsModal = ({ 
  isOpen, 
  onClose, 
  onAccept 
}: TermsAndConditionsModalProps) => {
  const [accepted, setAccepted] = React.useState(false);

  const handleAccept = () => {
    if (accepted) {
      // Store acceptance in localStorage
      localStorage.setItem('termsAccepted', 'true');
      localStorage.setItem('termsAcceptedDate', new Date().toISOString());
      onAccept();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-kasadya-purple" />
            Kasadya Events Terms and Conditions
          </DialogTitle>
          <DialogDescription>
            Please read and accept our terms and conditions before proceeding.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] mt-4 pr-4">
          <div className="space-y-4">
            <p className="font-medium">
              Welcome to Kasadya Events! By using our platform, you agree to the following terms and conditions. 
              Please read them carefully before completing any transaction.
            </p>
            
            <div>
              <h3 className="font-bold text-lg">1. Booking and Payment:</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  <strong>Payment Confirmation:</strong> Once your payment is successfully processed, your booking will be confirmed. 
                  Please note that all payments are final. We do not accept cancellations or refunds after payment has been completed.
                </li>
                <li>
                  <strong>Service Fees:</strong> Any additional service fees, taxes, or charges will be displayed clearly during 
                  the booking process. These are non-refundable once the transaction is completed.
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg">2. Vendor Selection:</h3>
              <p className="ml-6">
                Kasadya Events provides a platform for customers to browse, select, and book event service providers. 
                While we verify vendors to ensure quality and reliability, we do not directly control the services 
                provided by them. Customers are advised to read vendor reviews and confirm all event details directly 
                with the service provider.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg">3. Service Modifications:</h3>
              <p className="ml-6">
                Any changes to the services or event details (such as time, date, or venue) should be communicated 
                directly with the vendor. Kasadya Events is not responsible for changes made after the booking is confirmed.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg">4. Cancellation Policy:</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  <strong>No Cancellations:</strong> Once payment is confirmed and the booking is made, cancellations 
                  are not allowed. Please ensure that all details are accurate before proceeding with your payment.
                </li>
                <li>
                  <strong>Rescheduling:</strong> If you need to reschedule your event, please contact the respective 
                  vendor directly to discuss availability. Kasadya Events is not liable for any rescheduling arrangements.
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg">5. User Responsibilities:</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  You agree to use the platform only for lawful purposes and in accordance with our policies.
                </li>
                <li>
                  You must ensure that all information provided to us is accurate, including contact details and payment information.
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg">6. Liability:</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  Kasadya Events is not liable for any issues arising from services provided by event vendors. 
                  We recommend you discuss all event details with the vendors directly.
                </li>
                <li>
                  We are also not responsible for any disruptions, damages, or delays in the event caused by 
                  circumstances beyond our control.
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg">7. Privacy and Data Security:</h3>
              <p className="ml-6">
                By using our platform, you consent to our collection and use of your personal information in 
                accordance with our privacy policy. Your data is handled securely, and we take all necessary 
                precautions to protect it.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg">8. Changes to Terms and Conditions:</h3>
              <p className="ml-6">
                Kasadya Events reserves the right to update these terms and conditions at any time. 
                Any changes will be posted on this page, and it is your responsibility to review them regularly.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg">9. Contact Information:</h3>
              <p className="ml-6">
                If you have any questions about these terms, please contact us at support@kasadyaevents.com.
              </p>
            </div>
          </div>
        </ScrollArea>
        
        <div className="mt-4 flex items-center space-x-2">
          <Checkbox 
            id="terms" 
            checked={accepted} 
            onCheckedChange={(checked) => setAccepted(checked as boolean)} 
          />
          <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            I have read and agree to the terms and conditions
          </Label>
        </div>
        
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
          <Shield size={16} className="text-kasadya-purple" />
          <span>Your agreement is required before accessing booking services</span>
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button 
            onClick={handleAccept} 
            disabled={!accepted}
            className="bg-kasadya-purple hover:bg-kasadya-deep-purple"
          >
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAndConditionsModal;
