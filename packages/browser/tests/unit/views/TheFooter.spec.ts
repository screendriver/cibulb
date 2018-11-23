import { shallowMount } from '@vue/test-utils';
import TheFooter from '@/views/TheFooter.vue';

describe('<the-footer />', () => {
  it('should render correctly', () => {
    const wrapper = shallowMount(TheFooter);
    expect(wrapper).toMatchSnapshot();
  });
});
