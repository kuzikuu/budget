import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ExpenseForm from "./expense-form";

const HOUSEHOLD_ID = "default-household";
const USER_ID = "user1";

interface ReceiptScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseCreated: () => void;
}

export default function ReceiptScanner({ isOpen, onClose, onExpenseCreated }: ReceiptScannerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories", HOUSEHOLD_ID],
  });

  const processReceiptMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("receipt", file);
      formData.append("householdId", HOUSEHOLD_ID);
      formData.append("userId", USER_ID);

      const response = await fetch("/api/receipts/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process receipt");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setExtractedData(data);
      setIsProcessing(false);
      
      // Auto-fill expense form if data was extracted
      if (data.extractedAmount) {
        const suggestedCategory = categories.find((c: any) => 
          c.name.toLowerCase() === data.suggestedCategory?.toLowerCase()
        );
        
        const expenseData = {
          amount: data.extractedAmount.toString(),
          description: `Receipt from ${new Date(data.extractedDate || new Date()).toLocaleDateString()}`,
          categoryId: suggestedCategory?.id || "",
          receiptImage: data.imageUrl,
        };
        
        setShowExpenseForm(true);
        // Pass the extracted data to the expense form
        setExtractedData({ ...data, expenseData });
      }
    },
    onError: () => {
      setIsProcessing(false);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsProcessing(true);
      processReceiptMutation.mutate(file);
    }
  };

  const openCamera = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <>
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Receipt Scanner</h2>
        
        <div 
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={openCamera}
          data-testid="button-receipt-scanner"
        >
          {isProcessing ? (
            <div className="space-y-3">
              <i className="fas fa-spinner fa-spin text-3xl text-primary mb-3"></i>
              <div className="font-medium text-slate-800">Processing Receipt...</div>
              <div className="text-sm text-neutral">Extracting text and data...</div>
            </div>
          ) : selectedFile && extractedData ? (
            <div className="space-y-3">
              <i className="fas fa-check-circle text-3xl text-secondary mb-3"></i>
              <div className="font-medium text-slate-800">Receipt Processed!</div>
              <div className="text-sm text-neutral">
                {extractedData.extractedAmount && (
                  <div>Amount: ${extractedData.extractedAmount.toFixed(2)}</div>
                )}
                {extractedData.suggestedCategory && (
                  <div>Category: {extractedData.suggestedCategory}</div>
                )}
              </div>
              <button 
                onClick={() => setShowExpenseForm(true)}
                className="mt-4 bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                data-testid="button-create-expense-from-receipt"
              >
                <i className="fas fa-plus mr-2"></i>Create Expense
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <i className="fas fa-camera text-3xl text-neutral mb-3"></i>
              <div className="font-medium text-slate-800">Scan Receipt</div>
              <div className="text-sm text-neutral">Take a photo or upload an image</div>
              <button className="mt-4 bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                <i className="fas fa-camera mr-2"></i>Open Camera
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          data-testid="input-receipt-file"
        />

        <div className="mt-6 p-4 bg-surface rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <i className="fas fa-lightbulb text-secondary"></i>
            <span className="text-sm font-medium text-slate-800">Smart Features</span>
          </div>
          <ul className="text-sm text-neutral space-y-1">
            <li>• Auto-extract amount and date</li>
            <li>• Suggest expense categories</li>
            <li>• Share with household members</li>
            <li>• Store receipt images</li>
          </ul>
        </div>
      </section>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <ExpenseForm 
          isOpen={showExpenseForm}
          onClose={() => {
            setShowExpenseForm(false);
            setSelectedFile(null);
            setExtractedData(null);
          }}
          onExpenseCreated={() => {
            setShowExpenseForm(false);
            setSelectedFile(null);
            setExtractedData(null);
            onExpenseCreated();
          }}
          initialData={extractedData?.expenseData}
        />
      )}
    </>
  );
}
