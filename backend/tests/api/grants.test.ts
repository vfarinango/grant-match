import request from 'supertest';
import app from '../../src/app'; // Corrected import path
import { pool } from '../../src/db/connection';

describe('Grants API - Search Similar Feature', () => {

    beforeAll(async () => {
        // You would typically set up a test database here if needed.
        // For now, assuming your main DB has grants with IDs 1, 2, and 3.
        console.log('Using existing test data...');
    });

    afterAll(async () => {
        // You might have a cleanup function here for a test DB.
    });

    describe('GET /api/grants/:id/similar', () => {
        
        test('should return similar grants with enhanced response structure for Community Development Grant (ID: 1)', async () => {
            const response = await request(app)
                .get('/api/grants/1/similar')
                .expect(200);

            // Test enhanced response structure (consistent with search endpoint)
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('baseGrant');
            expect(response.body).toHaveProperty('results');
            expect(response.body).toHaveProperty('metadata');

            // Test baseGrant info
            expect(response.body.baseGrant).toHaveProperty('id', 1);
            expect(response.body.baseGrant).toHaveProperty('title');

            // Test results array
            expect(response.body.results).toBeInstanceOf(Array);
            expect(response.body.results.length).toBeGreaterThan(0);
            
            // Verify structure of returned grants and that the original grant is not included
            response.body.results.forEach((grant: any) => {
                expect(grant).toHaveProperty('id');
                expect(grant).toHaveProperty('title');
                expect(grant).toHaveProperty('description');
                expect(grant).toHaveProperty('focus_areas');
                expect(grant).toHaveProperty('similarity_score');
                expect(typeof grant.similarity_score).toBe('number');
                expect(grant.similarity_score).toBeGreaterThanOrEqual(0);
                expect(grant.similarity_score).toBeLessThanOrEqual(1);
                expect(grant.id).not.toBe(1); // Should not include the original grant
            });

            // Test metadata
            expect(response.body.metadata).toHaveProperty('totalResults');
            expect(response.body.metadata).toHaveProperty('basedOnGrantId', 1);
            expect(response.body.metadata).toHaveProperty('topSimilarityScore');
            expect(response.body.metadata.totalResults).toBe(response.body.results.length);

            // Verify similarity logic - should find grants with relevant focus areas
            const keywords = ['education', 'infrastructure', 'community'];
            const focusAreas = response.body.results.flatMap((grant: any) => grant.focus_areas || []);
            const hasRelevantKeyword = keywords.some(keyword => focusAreas.includes(keyword));
            expect(hasRelevantKeyword).toBeTruthy();

            // Test status logic
            expect(['excellent', 'good', 'fair', 'no_results']).toContain(response.body.status);
            
            // Test message content
            expect(response.body.message).toContain('similar grants');
            expect(response.body.message).toContain('Community Development Grant');
        });

        test('should return similar grants for Environmental Research Fund (ID: 2)', async () => {
            const response = await request(app)
                .get('/api/grants/2/similar')
                .expect(200);

            // Test response structure
            expect(response.body).toHaveProperty('results');
            expect(response.body).toHaveProperty('baseGrant');
            expect(response.body).toHaveProperty('metadata');
            
            expect(response.body.results).toBeInstanceOf(Array);
            expect(response.body.results.length).toBeGreaterThan(0);
            expect(response.body.baseGrant.id).toBe(2);
            
            response.body.results.forEach((grant: any) => {
                expect(grant).toHaveProperty('similarity_score');
                expect(grant.id).not.toBe(2); // Should not include the original grant
            });
            
            // Verify similarity logic - should find grants with relevant focus areas
            const keywords = ['environment', 'research'];
            const focusAreas = response.body.results.flatMap((grant: any) => grant.focus_areas || []);
            const hasRelevantKeyword = keywords.some(keyword => focusAreas.includes(keyword));
            expect(hasRelevantKeyword).toBeTruthy();
        });

        test('should return 404 for non-existent grant ID', async () => {
            const response = await request(app)
                .get('/api/grants/999/similar')
                .expect(404);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Grant not found');
        });

        test('should return 400 for invalid grant ID format', async () => {
            const response = await request(app)
                .get('/api/grants/invalid/similar')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Invalid grant ID format');
        });
        
        test('should limit results appropriately', async () => {
            const response = await request(app)
                .get('/api/grants/1/similar')
                .expect(200);
            
            // Your backend is configured to limit to 5 results based on the LIMIT 5 in the query
            expect(response.body.results.length).toBeLessThanOrEqual(5);
            expect(response.body.metadata.totalResults).toBeLessThanOrEqual(5);
        });
        
        test('should return grants ordered by similarity (most similar first)', async () => {
            const response = await request(app)
                .get('/api/grants/1/similar')
                .expect(200);

            if (response.body.results.length > 1) {
                // Verify that the similarity scores are in descending order
                const scores = response.body.results.map((r: any) => r.similarity_score);
                for (let i = 0; i < scores.length - 1; i++) {
                    expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
                }

                // Also verify the top similarity score matches metadata
                expect(response.body.metadata.topSimilarityScore).toBe(scores[0]);
            }
        });
        
        test('should handle grants with no similar matches gracefully', async () => {
            // This test assumes a grant (ID 3, "Arts & Culture") might be unique
            const response = await request(app)
                .get('/api/grants/3/similar') 
                .expect(200);

            expect(response.body).toHaveProperty('results');
            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('message');
            expect(response.body.results).toBeInstanceOf(Array);
            expect(response.body.results.length).toBeGreaterThanOrEqual(0);

            // If no results, should have appropriate status and message
            if (response.body.results.length === 0) {
                expect(response.body.status).toBe('no_results');
                expect(response.body.message).toContain('No similar grants found');
                expect(response.body.metadata.topSimilarityScore).toBeNull();
            }
        });

        test('should return proper status based on similarity scores', async () => {
            const response = await request(app)
                .get('/api/grants/1/similar')
                .expect(200);

            expect(['excellent', 'good', 'fair', 'no_results']).toContain(response.body.status);
            
            if (response.body.results.length > 0) {
                const topScore = response.body.metadata.topSimilarityScore;
                expect(typeof topScore).toBe('number');
                
                // Test status logic matches your backend implementation
                if (topScore >= 0.8) {
                    expect(response.body.status).toBe('excellent');
                    expect(response.body.message).toContain('highly similar');
                } else if (topScore >= 0.6) {
                    expect(response.body.status).toBe('good');
                    expect(response.body.message).toContain('similar grants');
                } else {
                    expect(response.body.status).toBe('fair');
                    expect(response.body.message).toContain('potentially similar');
                }
            }
        });

        test('should include all required grant fields in results', async () => {
            const response = await request(app)
                .get('/api/grants/1/similar')
                .expect(200);

            if (response.body.results.length > 0) {
                const grant = response.body.results[0];
                
                // Test all required fields are present
                expect(grant).toHaveProperty('id');
                expect(grant).toHaveProperty('title');
                expect(grant).toHaveProperty('description');
                expect(grant).toHaveProperty('similarity_score');
                
                // Test optional fields are handled properly
                expect(grant).toHaveProperty('deadline');
                expect(grant).toHaveProperty('funding_amount');
                expect(grant).toHaveProperty('source');
                expect(grant).toHaveProperty('source_url');
                expect(grant).toHaveProperty('focus_areas');
                expect(grant).toHaveProperty('posted_date');
                
                // Test data types
                expect(typeof grant.id).toBe('number');
                expect(typeof grant.title).toBe('string');
                expect(typeof grant.description).toBe('string');
                expect(typeof grant.similarity_score).toBe('number');
                
                if (grant.focus_areas) {
                    expect(Array.isArray(grant.focus_areas)).toBe(true);
                }
            }
        });

    });

    describe('Integration with existing endpoints', () => {
        
        test('should not break existing GET /api/grants endpoint', async () => {
            const response = await request(app)
                .get('/api/grants')
                .expect(200);

            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBeGreaterThan(0);
            
            // Verify grants don't have similarity_score (only similar search should have it)
            response.body.forEach((grant: any) => {
                expect(grant).not.toHaveProperty('similarity_score');
            });
        });

        test('should not break existing search endpoint', async () => {
            const response = await request(app)
                .get('/api/grants/search?query=education')
                .expect(200);
                
            expect(response.body).toHaveProperty('results');
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('metadata');
            expect(response.body.results).toBeInstanceOf(Array);
            expect(response.body.results.length).toBeGreaterThan(0);
            
            // Search results should have similarity_score, similar results should too
            response.body.results.forEach((grant: any) => {
                expect(grant).toHaveProperty('similarity_score');
                expect(typeof grant.similarity_score).toBe('number');
            });
        });

        test('should maintain consistent response formats across similar endpoints', async () => {
            // Test that search and similar endpoints have similar response structures
            const searchResponse = await request(app)
                .get('/api/grants/search?query=education')
                .expect(200);
                
            const similarResponse = await request(app)
                .get('/api/grants/1/similar')
                .expect(200);

            // Both should have these common properties
            ['message', 'status', 'results', 'metadata'].forEach(prop => {
                expect(searchResponse.body).toHaveProperty(prop);
                expect(similarResponse.body).toHaveProperty(prop);
            });

            // Both should have consistent status values
            const validStatuses = ['excellent', 'good', 'fair', 'no_results'];
            expect(validStatuses).toContain(searchResponse.body.status);
            expect(validStatuses).toContain(similarResponse.body.status);
        });
    });
});