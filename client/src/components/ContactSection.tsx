import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Github, Linkedin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertContactSchema, type InsertContact } from "@shared/schema";

const socialLinks = [
  {
    icon: Mail,
    label: "Email",
    value: "2802jayagrawal@gmail.com",
    href: "mailto:2802jayagrawal@gmail.com",
    color: "from-red-500 to-orange-500",
  },
  {
    icon: Github,
    label: "GitHub",
    value: "github.com/Techie-AgrawalJi",
    href: "https://github.com/Techie-AgrawalJi/",
    color: "from-gray-600 to-gray-800",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "linkedin.com/JayAgrawal",
    href: "www.linkedin.com/in/techie-agrawalji",
    color: "from-blue-600 to-blue-800",
  },

];

export function ContactSection() {
  const { toast } = useToast();

  const form = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: InsertContact) =>
      apiRequest("POST", "/api/contacts", data),
    onSuccess: () => {
      toast({
        title: "Message Sent Successfully",
        description: "Thank you! I'll get back to you as soon as possible.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Failed to Send",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertContact) => {
    mutation.mutate(data);
  };

  return (
    <section
      id="contact"
      className="py-24 relative"
      data-testid="section-contact"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16 animate-slide-up">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 gradient-text"
            data-testid="heading-contact"
          >
            Get In Touch
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
            Have a project in mind or want to collaborate? I'd love to hear from
            you.
          </p>
          <blockquote
            className="text-lg italic text-muted-foreground/80 max-w-xl mx-auto"
            data-testid="quote-contact"
          >
            "Communication is the key to success."
            
          </blockquote>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="animate-slide-up">
            <h3 className="text-2xl font-semibold mb-6 text-foreground">
              Send a Message
            </h3>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your full name"
                          data-testid="input-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          data-testid="input-email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell me about your project or just say hello..."
                          rows={5}
                          data-testid="input-message"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={mutation.isPending}
                  data-testid="button-send-message"
                >
                  {mutation.isPending ? "Sending…" : "Send Message"}
                </Button>
              </form>
            </Form>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: "150ms" }}>
            <h3 className="text-2xl font-semibold mb-6 text-foreground">
              Connect With Me
            </h3>
            <div className="grid gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Card
                    key={social.label}
                    className="hover-elevate overflow-visible"
                    data-testid={`card-social-${social.label.toLowerCase()}`}
                  >
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${social.color} flex items-center justify-center shrink-0`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {social.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {social.value}
                        </p>
                      </div>
                    </a>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
