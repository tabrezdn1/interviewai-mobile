import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft,
    Award,
    BarChart3,
    Building,
    CheckCircle,
    Clock,
    FileText,
    MessageSquare,
    Target,
    TrendingUp,
    User,
    Zap
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { DatabaseService, Feedback, Interview } from '../../../src/services/DatabaseService';
import { useAuthStore } from '../../../src/store/authStore';
import { getScoreColor } from '../../../src/utils/helpers';

type TabType = 'summary' | 'skills' | 'transcript' | 'analysis';

const FeedbackDetailScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  useEffect(() => {
    loadFeedbackData();
  }, [id]);

  const loadFeedbackData = async () => {
    if (!id || !user?.id) return;
    
    try {
      const [interviewData, feedbackData] = await Promise.all([
        DatabaseService.getInterviews(user.id).then(interviews => 
          interviews.find(i => i.id === id)
        ),
        DatabaseService.getFeedback(id)
      ]);
      
      if (interviewData) {
        setInterview(interviewData);
      }
      
      if (feedbackData) {
        setFeedback(feedbackData);
      } else {
        // Create comprehensive mock feedback if none exists
        setFeedback(createMockFeedback(interviewData));
      }
    } catch (error) {
      console.error('Error loading feedback data:', error);
      Alert.alert('Error', 'Failed to load feedback details');
    } finally {
      setLoading(false);
    }
  };

  // Function to trim transcript and remove system prompt
  const trimTranscript = (transcript: string): string => {
    if (!transcript) return 'Transcript not available for this interview.';
    
    // Find the first occurrence of "user:" (case-insensitive)
    const userIndex = transcript.toLowerCase().indexOf('user:');
    
    if (userIndex === -1) {
      // If no "user:" found, return the original transcript
      return transcript;
    }
    
    // Return everything from the first "user:" occurrence onwards
    return transcript.substring(userIndex);
  };

  const createMockFeedback = (interviewData: Interview | undefined): Feedback => {
    const overallScore = interviewData?.score || 80;
    return {
      id: 1,
      interview_id: id as string,
      overall_score: overallScore,
      summary: "The candidate demonstrated a good understanding of product management principles and shows alignment with customer-first approach. However, there were areas where more detail could have been provided, specifically around technical skills and product lifecycle understanding. The candidate articulated customer-centric design principles well and showed potential for translating customer needs into effective product strategies.",
      strengths: [
        "Strong understanding of product management principles",
        "Clear alignment with customer-first approach", 
        "Excellent articulation of customer-centric design",
        "Good potential for translating customer needs into strategies",
        "Strong communication and presentation skills"
      ],
      improvements: [
        "Deeper technical skills understanding",
        "More comprehensive product lifecycle knowledge",
        "Enhanced market research experience",
        "Better familiarity with leadership principles",
        "More concrete examples from past experiences"
      ],
      technical_score: 72,
      communication_score: 85,
      problem_solving_score: 78,
      experience_score: 75,
      technical_feedback: "Demonstrated solid understanding of core concepts but could benefit from deeper technical implementation knowledge. Consider expanding expertise in API design, system architecture, and data analytics.",
      communication_feedback: "Excellent verbal communication skills with clear articulation and good structure. Maintained professional demeanor throughout and responses were easy to follow.",
      problem_solving_feedback: "Approached problems methodically with good analytical thinking. Could benefit from exploring multiple solution approaches and demonstrating more creative problem-solving techniques.",
      experience_feedback: "Provided relevant examples from past work with well-structured narratives. Could enhance responses with more specific metrics and measurable outcomes.",
      created_at: new Date().toISOString(),
      transcript: `System: You are an AI interviewer conducting a product management interview for Amazon. Focus on leadership principles, customer obsession, and technical acumen. Ask about past experiences, problem-solving approaches, and product strategy.

User: Hello, I'm ready to start the interview.

Interviewer: Hello! Thank you for joining me today. I'm excited to learn more about your background and experience in product management. Let's start with a broad question - can you tell me about yourself and your journey into product management?

User: I have been working in product management for the past 3 years, primarily focused on e-commerce platforms. I started my career as a business analyst and transitioned into product management because I was passionate about solving customer problems and building products that make a real difference.

Interviewer: That's a great foundation. Customer focus is crucial in product management. How do you approach prioritizing features in a product roadmap?

User: I use a combination of customer feedback, business impact, and technical feasibility. I typically start by gathering data from customer support tickets, user research, and analytics to understand what problems we need to solve. Then I work with the engineering team to understand the technical complexity and with business stakeholders to understand the potential impact.

Interviewer: Can you describe a time when you had to make a difficult product decision?

User: In my previous role, we had to decide between building a new feature that customers were asking for versus improving the performance of our existing platform. The new feature would drive short-term engagement, but the performance improvements were critical for long-term success. I analyzed the data and found that our page load times were causing significant user drop-off. I made the decision to prioritize the performance improvements, and we saw a 25% increase in user retention over the following quarter.

Interviewer: How do you handle stakeholder disagreements?

User: I believe in data-driven decision making and transparent communication. When stakeholders disagree, I first ensure everyone understands the customer impact and business metrics involved. I facilitate discussions to align on shared goals and use customer research and data to guide decisions rather than opinions.

[Interview continued with additional technical and behavioral questions...]`,
      tavus_conversation_id: 'conv_abc123',
      tavus_analysis: `# Interview Analysis Report

## Overall Assessment (Score: ${overallScore}%)

The candidate shows strong product management fundamentals with good customer focus and analytical thinking. Communication is clear and structured. Areas for improvement include deeper technical knowledge and more specific examples with quantifiable outcomes.

## Detailed Analysis

### Customer Obsession (Score: 82%)

**Assessment:** Candidate demonstrates strong customer-first mindset, consistently mentioning customer feedback and user research in decision-making processes. Good understanding of customer impact analysis.

**Evidence:**
- Referenced customer support tickets and user research for prioritization
- Mentioned analyzing user drop-off data for performance decisions  
- Emphasized understanding customer needs in stakeholder discussions

**Areas for Improvement:**
- Could provide more specific customer feedback examples
- More detail on customer interview processes and methodologies

### Leadership Principles (Score: 75%)

**Assessment:** Shows good analytical thinking and data-driven decision making. Demonstrates ownership in difficult decisions. Could strengthen examples of leading teams and driving innovation.

**Evidence:**
- Made difficult decision to prioritize performance over new features
- Used data to support decision-making and measure success
- Took ownership of product decisions and their outcomes

**Areas for Improvement:**
- More examples of leading cross-functional teams
- Demonstrate innovation and thinking big
- Show examples of developing others and hiring talent

### Technical Acumen (Score: 68%)

**Assessment:** Basic understanding of technical concepts and constraints. Collaborates well with engineering teams. Would benefit from deeper technical knowledge for senior-level product roles.

**Evidence:**
- Considers technical feasibility in roadmap prioritization
- Works with engineering team to understand complexity
- Understands impact of technical performance on user experience

**Areas for Improvement:**
- Deeper understanding of system architecture and scalability
- More knowledge of API design and data infrastructure
- Enhanced ability to make technical trade-off decisions

### Communication Skills (Score: 88%)

**Assessment:** Excellent verbal communication with clear structure and logical flow. Maintains professional demeanor. Responses are well-organized and easy to follow.

**Evidence:**
- Clear and structured responses to all questions
- Professional tone and demeanor throughout
- Good use of specific examples to illustrate points

**Areas for Improvement:**
- Could include more quantitative metrics in examples
- Slightly more enthusiasm and energy in delivery

### Problem Solving (Score: 79%)

**Assessment:** Methodical approach to problem-solving with good analytical thinking. Uses data effectively to make decisions. Could demonstrate more creative or innovative solutions.

**Evidence:**
- Systematic approach to feature prioritization
- Data-driven analysis of performance vs feature trade-offs
- Structured approach to stakeholder conflict resolution

**Areas for Improvement:**
- More creative problem-solving approaches
- Examples of innovative solutions to complex problems
- Demonstrate thinking outside conventional frameworks

## Recommendations

### High Priority: Technical Growth
Invest time in understanding system architecture, API design, and data infrastructure to make better technical trade-offs and communicate more effectively with engineering teams.

### Medium Priority: Leadership Development
Seek opportunities to lead larger cross-functional initiatives and develop team members. Practice articulating vision and inspiring others around product strategy.

### Medium Priority: Quantitative Impact
Strengthen examples with specific metrics and measurable outcomes. Practice the STAR method to structure responses with clear situation, task, action, and results.

### Low Priority: Innovation Mindset
Explore more creative problem-solving approaches and think beyond conventional solutions. Study innovative product strategies from industry leaders.

## Interview Performance Metrics

- **Response Quality:** 78%
- **Depth of Examples:** 72%
- **Communication Clarity:** 88%
- **Confidence Level:** 76%
- **Preparation Level:** 74%

---

*Analysis generated by AI Interview Assistant*`
    };
  };

  const getScoreRating = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Work';
  };

  const renderHeader = () => (
    <View style={{ backgroundColor: '#1e293b', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 }}>
      <TouchableOpacity 
        onPress={() => router.back()}
        style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginBottom: 20 
        }}
      >
        <ArrowLeft size={24} color="white" />
        <Text style={{ marginLeft: 8, fontSize: 16, color: 'white', fontWeight: '500' }}>
          Back to Feedback
        </Text>
      </TouchableOpacity>
      
      <View>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 8 }}>
          Interview Feedback
        </Text>
        <Text style={{ fontSize: 16, color: '#94a3b8' }}>
          {interview?.role} at {interview?.company}
        </Text>
      </View>
    </View>
  );

  const renderOverallScore = () => (
    <View style={{
      backgroundColor: '#1e293b',
      margin: 20,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center'
    }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: 'white', marginBottom: 20 }}>
        Overall Score
      </Text>
      
      <View style={{
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 6,
        borderColor: getScoreColor(feedback?.overall_score || 0),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16
      }}>
        <Text style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: 'white'
        }}>
          {feedback?.overall_score || '--'}
        </Text>
      </View>
      
      <Text style={{ fontSize: 16, fontWeight: '600', color: getScoreColor(feedback?.overall_score || 0) }}>
        {getScoreRating(feedback?.overall_score || 0)}
      </Text>
    </View>
  );

  const renderKeyMetrics = () => (
    <View style={{
      backgroundColor: '#1e293b',
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 16,
      padding: 20
    }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: 'white', marginBottom: 16 }}>
        Key Metrics
      </Text>
      
      <View style={{ flexDirection: 'row', gap: 20 }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Award size={20} color="#3b82f6" />
          <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 8, marginBottom: 4 }}>
            Overall Score
          </Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
            {feedback?.overall_score || '--'}%
          </Text>
        </View>
        
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Clock size={20} color="#10b981" />
          <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 8, marginBottom: 4 }}>
            Duration
          </Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
            {interview?.duration || 20} min
          </Text>
        </View>
      </View>
    </View>
  );

  const renderInterviewConfig = () => (
    <View style={{
      backgroundColor: '#1e293b',
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 16,
      padding: 20
    }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: 'white', marginBottom: 16 }}>
        Interview Details
      </Text>
      
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Building size={16} color="#7c3aed" />
            <Text style={{ marginLeft: 8, color: '#94a3b8', fontSize: 14 }}>Position</Text>
          </View>
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
            {interview?.role || 'Product Manager'}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Building size={16} color="#1e40af" />
            <Text style={{ marginLeft: 8, color: '#94a3b8', fontSize: 14 }}>Company</Text>
          </View>
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
            {interview?.company || 'Amazon'}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Target size={16} color="#3b82f6" />
            <Text style={{ marginLeft: 8, color: '#94a3b8', fontSize: 14 }}>Type</Text>
          </View>
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
            {interview?.interview_types?.title || 'Technical'}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Zap size={16} color="#059669" />
            <Text style={{ marginLeft: 8, color: '#94a3b8', fontSize: 14 }}>Level</Text>
          </View>
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
            {interview?.experience_levels?.label || 'Entry Level'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={{ 
      backgroundColor: '#1e293b', 
      paddingHorizontal: 20, 
      borderBottomWidth: 1, 
      borderBottomColor: '#334155' 
    }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { key: 'summary', label: 'Summary', icon: FileText },
            { key: 'skills', label: 'Skills', icon: BarChart3 },
            { key: 'transcript', label: 'Transcript', icon: MessageSquare },
            { key: 'analysis', label: 'Analysis', icon: TrendingUp }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key as TabType)}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderBottomWidth: 2,
                borderBottomColor: activeTab === tab.key ? '#3b82f6' : 'transparent',
                opacity: activeTab === tab.key ? 1 : 0.7,
                minWidth: 80
              }}
            >
              <Text style={{ 
                color: activeTab === tab.key ? '#3b82f6' : 'white', 
                fontSize: 14,
                fontWeight: activeTab === tab.key ? '600' : '400',
                textAlign: 'center'
              }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderSummaryTab = () => (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 16 }}>
        Overall Performance
      </Text>
      
      <Text style={{ 
        fontSize: 16, 
        color: '#e2e8f0', 
        lineHeight: 24,
        marginBottom: 32
      }}>
        {feedback?.summary}
      </Text>

      {/* Strengths */}
      <View style={{ marginBottom: 32 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <CheckCircle size={20} color="#10b981" />
          <Text style={{ marginLeft: 8, fontSize: 18, fontWeight: '600', color: 'white' }}>
            Strengths
          </Text>
        </View>
        
        {feedback?.strengths?.map((strength, index) => (
          <View key={index} style={{ 
            flexDirection: 'row', 
            alignItems: 'flex-start', 
            marginBottom: 12 
          }}>
            <CheckCircle size={16} color="#10b981" style={{ marginTop: 2 }} />
            <Text style={{ 
              flex: 1, 
              marginLeft: 12,
              fontSize: 14, 
              color: '#e2e8f0', 
              lineHeight: 20 
            }}>
              {strength}
            </Text>
          </View>
        ))}
      </View>

      {/* Areas for Improvement */}
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TrendingUp size={20} color="#f59e0b" />
          <Text style={{ marginLeft: 8, fontSize: 18, fontWeight: '600', color: 'white' }}>
            Areas for Improvement
          </Text>
        </View>
        
        {feedback?.improvements?.map((improvement, index) => (
          <View key={index} style={{ 
            flexDirection: 'row', 
            alignItems: 'flex-start', 
            marginBottom: 12 
          }}>
            <View style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#f59e0b',
              marginTop: 7
            }} />
            <Text style={{ 
              flex: 1, 
              marginLeft: 12,
              fontSize: 14, 
              color: '#e2e8f0', 
              lineHeight: 20 
            }}>
              {improvement}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderSkillsTab = () => (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 24 }}>
        Skills Assessment
      </Text>
      
      {[
        { label: 'Technical Skills', score: feedback?.technical_score || 0, icon: Zap, feedback: feedback?.technical_feedback },
        { label: 'Communication', score: feedback?.communication_score || 0, icon: MessageSquare, feedback: feedback?.communication_feedback },
        { label: 'Problem Solving', score: feedback?.problem_solving_score || 0, icon: TrendingUp, feedback: feedback?.problem_solving_feedback },
        { label: 'Experience', score: feedback?.experience_score || 0, icon: User, feedback: feedback?.experience_feedback }
      ].map((skill, index) => (
        <View key={index} style={{ marginBottom: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <skill.icon size={16} color="#94a3b8" />
              <Text style={{ marginLeft: 8, fontSize: 16, color: 'white', fontWeight: '600' }}>
                {skill.label}
              </Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: getScoreColor(skill.score) }}>
              {skill.score}%
            </Text>
          </View>
          
          <View style={{ 
            height: 6, 
            backgroundColor: '#334155', 
            borderRadius: 3,
            overflow: 'hidden',
            marginBottom: 12
          }}>
            <View style={{
              height: '100%',
              width: `${skill.score}%`,
              backgroundColor: getScoreColor(skill.score),
              borderRadius: 3
            }} />
          </View>
          
          {skill.feedback && (
            <Text style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 20 }}>
              {skill.feedback}
            </Text>
          )}
        </View>
      ))}
    </View>
  );

  const renderTranscriptTab = () => (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 20 }}>
        Interview Transcript
      </Text>
      
      <View style={{ 
        backgroundColor: '#334155', 
        borderRadius: 12, 
        padding: 16
      }}>
        <Text style={{ 
          fontSize: 14, 
          color: '#e2e8f0', 
          lineHeight: 22,
          fontFamily: 'monospace'
        }}>
          {trimTranscript(feedback?.transcript || '')}
        </Text>
      </View>
    </View>
  );

  const renderAnalysisTab = () => {
    const analysisText = feedback?.tavus_analysis;
    
    // Debug logging
    console.log('Feedback object:', feedback);
    console.log('Analysis text:', analysisText);
    
    if (!analysisText || typeof analysisText !== 'string') {
      return (
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 20 }}>
            Detailed Analysis
          </Text>
          <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 40 }}>
            Analysis data not available for this interview.
          </Text>
          <Text style={{ fontSize: 12, color: '#64748b', textAlign: 'center', marginTop: 8 }}>
            Debug: feedback={feedback ? 'exists' : 'null'}, analysis={analysisText ? 'exists' : 'null'}
          </Text>
        </View>
      );
    }

    // Simple markdown parser for React Native
    const renderMarkdownText = (text: string) => {
      const lines = text.split('\n');
      const components: React.ReactNode[] = [];
      let currentIndex = 0;

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        if (!trimmedLine && index < lines.length - 1) {
          // Empty line - add spacing
          components.push(
            <View key={`space-${currentIndex++}`} style={{ height: 12 }} />
          );
          return;
        }

        // H1 Headers (# )
        if (trimmedLine.startsWith('# ')) {
          const headerText = trimmedLine.substring(2);
          components.push(
            <Text key={`h1-${currentIndex++}`} style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 16,
              marginTop: index > 0 ? 24 : 0
            }}>
              {headerText}
            </Text>
          );
          return;
        }

        // H2 Headers (## )
        if (trimmedLine.startsWith('## ')) {
          const headerText = trimmedLine.substring(3);
          components.push(
            <Text key={`h2-${currentIndex++}`} style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#e2e8f0',
              marginBottom: 12,
              marginTop: 20
            }}>
              {headerText}
            </Text>
          );
          return;
        }

        // H3 Headers (### )
        if (trimmedLine.startsWith('### ')) {
          const headerText = trimmedLine.substring(4);
          // Extract score if present
          const scoreMatch = headerText.match(/\(Score: (\d+)%\)/);
          const titleText = headerText.replace(/\s*\(Score: \d+%\)/, '');
          
          components.push(
            <View key={`h3-container-${currentIndex++}`} style={{
              backgroundColor: '#1e293b',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              marginTop: 8,
              borderLeftWidth: 4,
              borderLeftColor: '#3b82f6'
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: 'white'
                }}>
                  {titleText}
                </Text>
                {scoreMatch && (
                  <Text style={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: getScoreColor(parseInt(scoreMatch[1]))
                  }}>
                    {scoreMatch[1]}%
                  </Text>
                )}
              </View>
            </View>
          );
          return;
        }

        // Bullet points (- )
        if (trimmedLine.startsWith('- ')) {
          const bulletText = trimmedLine.substring(2);
          components.push(
            <View key={`bullet-${currentIndex++}`} style={{
              flexDirection: 'row',
              marginBottom: 8,
              paddingLeft: 16
            }}>
              <Text style={{ color: '#3b82f6', marginRight: 8, marginTop: 2 }}>•</Text>
              <Text style={{
                fontSize: 14,
                color: '#cbd5e1',
                lineHeight: 20,
                flex: 1
              }}>
                {bulletText}
              </Text>
            </View>
          );
          return;
        }

        // Bold text (**text**)
        if (trimmedLine.includes('**')) {
          const parts = trimmedLine.split('**');
          const textComponents: React.ReactNode[] = [];
          
          parts.forEach((part, partIndex) => {
            if (partIndex % 2 === 0) {
              // Regular text
              if (part) {
                textComponents.push(
                  <Text key={`regular-${partIndex}`} style={{ color: '#cbd5e1' }}>
                    {part}
                  </Text>
                );
              }
            } else {
              // Bold text
              textComponents.push(
                <Text key={`bold-${partIndex}`} style={{ 
                  color: '#e2e8f0', 
                  fontWeight: '600' 
                }}>
                  {part}
                </Text>
              );
            }
          });

          components.push(
            <Text key={`formatted-${currentIndex++}`} style={{
              fontSize: 14,
              lineHeight: 20,
              marginBottom: 12,
              paddingLeft: 16
            }}>
              {textComponents}
            </Text>
          );
          return;
        }

        // Priority headers (### Priority:)
        if (trimmedLine.match(/^### (High|Medium|Low) Priority:/)) {
          const priorityMatch = trimmedLine.match(/^### (High|Medium|Low) Priority: (.+)/);
          if (priorityMatch) {
            const priority = priorityMatch[1];
            const title = priorityMatch[2];
            const priorityColors = {
              High: '#ef4444',
              Medium: '#f59e0b',
              Low: '#10b981'
            };

            components.push(
              <View key={`priority-${currentIndex++}`} style={{
                backgroundColor: '#1e293b',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderLeftWidth: 4,
                borderLeftColor: '#06b6d4'
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#e2e8f0'
                  }}>
                    {title}
                  </Text>
                  <View style={{
                    backgroundColor: priorityColors[priority as keyof typeof priorityColors],
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 4
                  }}>
                    <Text style={{
                      fontSize: 11,
                      fontWeight: '500',
                      color: 'white'
                    }}>
                      {priority} Priority
                    </Text>
                  </View>
                </View>
              </View>
            );
            return;
          }
        }

        // Regular paragraph text
        if (trimmedLine && !trimmedLine.startsWith('---') && !trimmedLine.startsWith('*Analysis generated')) {
          components.push(
            <Text key={`text-${currentIndex++}`} style={{
              fontSize: 14,
              color: '#cbd5e1',
              lineHeight: 20,
              marginBottom: 12,
              paddingLeft: 16
            }}>
              {trimmedLine}
            </Text>
          );
        }

        // Separator line (---)
        if (trimmedLine.startsWith('---')) {
          components.push(
            <View key={`separator-${currentIndex++}`} style={{
              height: 1,
              backgroundColor: '#334155',
              marginVertical: 20
            }} />
          );
        }

        // Footer text (*Analysis generated...)
        if (trimmedLine.startsWith('*Analysis generated')) {
          components.push(
            <Text key={`footer-${currentIndex++}`} style={{
              fontSize: 12,
              color: '#64748b',
              fontStyle: 'italic',
              textAlign: 'center',
              marginTop: 12
            }}>
              {trimmedLine.replace(/^\*/, '').replace(/\*$/, '')}
            </Text>
          );
        }
      });

      return components;
    };

    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 20 }}>
          Detailed Analysis
        </Text>
        
        <ScrollView style={{ flex: 1 }} nestedScrollEnabled={true}>
          {renderMarkdownText(analysisText)}
        </ScrollView>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return renderSummaryTab();
      case 'skills':
        return renderSkillsTab();
      case 'transcript':
        return renderTranscriptTab();
      case 'analysis':
        return renderAnalysisTab();
      default:
        return renderSummaryTab();
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 16, color: '#94a3b8', fontSize: 16 }}>Loading feedback...</Text>
      </View>
    );
  }

  if (!interview) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <FileText size={48} color="#94a3b8" style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: 18, color: '#94a3b8', marginBottom: 8 }}>Interview not found</Text>
        <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 24, textAlign: 'center' }}>
          The interview data could not be loaded
        </Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ backgroundColor: '#3b82f6', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      {renderHeader()}
      
      <ScrollView style={{ flex: 1 }}>
        {renderOverallScore()}
        {renderKeyMetrics()}
        {renderInterviewConfig()}
        
        {renderTabs()}
        
        <View style={{ backgroundColor: '#0f172a' }}>
          {renderTabContent()}
        </View>
      </ScrollView>
    </View>
  );
};

export default FeedbackDetailScreen; 